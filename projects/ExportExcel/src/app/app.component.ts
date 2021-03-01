import { Component } from '@angular/core';
import {MainTableService} from './services/main-table.service';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { DatePipe } from '@angular/common';
import { map, switchMap } from 'rxjs/operators';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  data: any[]=[];
  allData:any[]=[];
  currentYear:string;
  constructor(private excelService:MainTableService,private sis: SharepointIntegrationService){
  }
  ngOnInit() {
    this.currentYear=new Date().getFullYear().toString();
    this.getAllData();
    console.log(this.data);

  }
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.data, 'Periodo');
  }
  getAllData()
  {
    const data={
      select:['Fecha','Categoria/Categoria','Topico/Topico', 'Id','Nivel/Nivel','Periodo','Entrenador'],
      top:5000,
      filter:['Periodo eq ' + this.currentYear],
      expand:['Categoria','Topico','Nivel']
      
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Fechas', data)
    .pipe(
      map((cursos: any) => this.getFechasInfo(cursos.value)),
      //switchMap((cursos) => this.getCriterios(cursos)),
    ).subscribe(response =>{
      console.log(response);
      response.forEach(c=>{
        this.getCriterios(c);
      })
    });
  }
  getFechasInfo(cursos:any[])
  {
    const datePipe = new DatePipe('en-US');
    return cursos.map(curso =>({
      id: curso.Id,
      Fecha: datePipe.transform(new Date(curso.Fecha), 'dd-MM-yyyy'),
      Entrenador: curso.Entrenador,
      Categoria:curso.Categoria.Categoria,
      Nivel: curso.Nivel.Nivel,
      Topico: curso.Topico.Topico,
      
      //Criterio: curso.Criterio.Criterio
    }));
  }
  getCriterios(c)
  {
    const data={
      select:['Id,Criterio'],
      top:1,
      filter: ['Id eq ' + c.id]
    };
      this.sis.read("Criterios",data).subscribe((response:any)=>{
        c.Criterio= response.value[0].Criterio
        this.data.push(c);
    })
  }

}
