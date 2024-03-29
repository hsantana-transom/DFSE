import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { SharepointIntegrationService } from 'shared-lib';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {

  constructor(private sis: SharepointIntegrationService) {
  }

    /**
   * Exports data to excel file
   * @param json data array
   * @param excelFileName excel file name to save
   */
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

   /**
   * Saves data in excel File
   * @param json data array
   * @param excelFileName excel file name to save
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + new  Date().getFullYear() + EXCEL_EXTENSION);
  }

  /**
   * Gets courses information data
   * @param id course id
   */
  getCursosInfo(id)
  {
      const data = {
        select: ['Categoria/Categoria', 'Id', 'Topico/Topico', 'Nivel/Nivel','CriterioId'],
        top: 1,
        filter:["Id eq '" + id + "'" ],
        expand:["Categoria,Topico,Nivel"]
      };
  
      return this.sis.read('Fechas', data);
    
  }
  
  /**
   * gets Criteria information data
   * @param idCriterio id criteria
   */
  getCriterioInfo(idCriterio)
  {
    const data = {
      select: ['Criterio', 'Id'],
      top: 1,
      filter:["Id eq '" + idCriterio + "'" ],
    };

    return this.sis.read('Criterios', data);
  }

}
