import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainDataSource } from '../datasources/main-data-source';
/**
 * Main service
 */
@Injectable({
  providedIn: 'root'
})

export class MainTableService {
  dataSource: MainDataSource;
  constructor(private sis: SharepointIntegrationService) {
    this.dataSource = new MainDataSource();
  }

  /**
   * Clears data in dataSource array
   */
  clearAll() {
    this.dataSource.clearAll();
  }

  /**
   * Gets data from Period Sharepoint List
   */
  loadData() {
    const data = {
      select: ['Periodo','FechaInicial','FechaFinal', 'Id', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Periodos', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Periodo,
              fechaI: new Date(r.FechaInicial),
              fechaF: new Date(r.FechaFinal)
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.fechaILabel= datePipe.transform(item.fechaI, 'dd-MM-yyyy');
            item.fechaFLabel= datePipe.transform(item.fechaF, 'dd-MM-yyyy');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
  
  /**
   * Gets search Data from Period Sharepoint list
   * @param search search string to filter query
   */
  loadSearch(search) {
    var fields=['Id','Periodo','FechaInicialString','FechaFinalString']
    const data = {
      select: ['Periodo','FechaInicial','FechaFinal', 'Id', 'Created'],
      top: 5000,
      filter:fields.map(f => `substringof('${search}',${f})`)//["substringof('" + search + "',Criterio)"] 
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Periodos', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Periodo,
              fechaI: new Date(r.FechaInicial),
              fechaF: new Date(r.FechaFinal)
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.fechaILabel= datePipe.transform(item.fechaI, 'dd-MM-yyyy');
            item.fechaFLabel= datePipe.transform(item.fechaF, 'dd-MM-yyyy');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
