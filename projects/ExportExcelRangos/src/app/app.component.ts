import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from './services/main-table.service';

/**
 * Main app component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  mainForm: FormGroup;
  dataCurrentUser;
  dataUser:any=[];
  data: any[]=[];
  displayedColumns: string[] = ['Email','Categoria', 'Nivel','Topico','Criterio'];
  currentYear;
  minDate: Date;
  maxDate: Date;
  fechaIString:string;
  fechaFString:string;
  bandFechas=false;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private excelService:MainTableService
  ) { 
    this.getCurrentUser();
  }
  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    const datePipe = new DatePipe('en-US');
    this.setupForm();
    this.mainForm.get("fecha2").valueChanges.subscribe(v=>{
      this.fechaFString=datePipe.transform(new Date(v), 'dd-MM-yyyy');
      this.verificaFechas();
    });
    this.mainForm.get("fecha1").valueChanges.subscribe(v=>{
      this.fechaIString=datePipe.transform(new Date(v), 'dd-MM-yyyy');
      this.verificaFechas();
    });
  }
  /**
   * calls excel service method to export data
   */
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.data, 'Cursos aprobados - Periodo');
  }
  /**
   * checks the two selected dates
   */
  verificaFechas()
  {
    if(this.mainForm.get('fecha1').value != null && this.mainForm.get('fecha2').value != null)
    {
      if(this.mainForm.get('fecha1').value > this.mainForm.get('fecha2').value)
        this.bandFechas=true;
      else
        this.bandFechas=false;
    }
  }
  /**
   * Gets data to export
   */
  getData()
  {
    this.loading=true;
    this.data=[];
    var data
    if(this.dataUser[0].Rol=="APROBADOR")
    {
        data={
        select:['Nombre','Descripcion','ComentariosContra', 'Id','ComentariosFactory','IdFecha','Documentos','UserIdId','IdCursoId','IdCurso/Fecha','IdCurso/Entrenador','UserId/Nombre','UserId/Email'],
        top:5000,
        filter:["IdCurso/Fecha ge '" + this.mainForm.get('fecha1').value.toISOString() + "'", 
        "IdCursoId/Fecha le '" + this.mainForm.get('fecha2').value.toISOString() + "'",
        "Estatus eq 'Aceptado'"
        ],
        expand:['IdCurso','UserId']
        
      };
    }
    if(this.dataUser[0].Rol=="USUARIO")
    {
        data={
        select:['Nombre','Descripcion','ComentariosContra', 'Id','ComentariosFactory','IdFecha','Documentos','UserIdId','IdCursoId','IdCurso/Fecha','IdCurso/Entrenador','UserId/Nombre','UserId/Email'],
        top:5000,
        filter:["IdCurso/Fecha ge '" + this.mainForm.get('fecha1').value.toISOString() + "'", 
        "IdCursoId/Fecha le '" + this.mainForm.get('fecha2').value.toISOString() + "'",
        "Estatus eq 'Aceptado'",
        "UserId/Email eq '" + this.dataUser[0].Email + "'"
        ],
        expand:['IdCurso','UserId']
        
      };
    }
    const datePipe = new DatePipe('en-US');
    this.sis.read('Entrada', data)
    .pipe(
      map((cursos: any) => this.getCursosInfo(cursos.value)),
      switchMap((cursos:any) => this.getCursosData(cursos)),
      switchMap((cursos:any) => this.getCriterioInfo(cursos)),
      
    ).subscribe(response =>{
      console.log(response);
      this.data= response;
      for(var i=0; i< this.data.length; i++)
      {
        this.data[i].Categoria= this.data[i].curso.value[0].Categoria.Categoria,
        this.data[i].Topico =this.data[i].curso.value[0].Topico.Topico,
        this.data[i].Nivel = this.data[i].curso.value[0].Nivel.Nivel
        this.data[i].Criterio = this.data[i].criterio.value[0].Criterio
      }
      this.loading=false;
    });
  }
  /**
   * Creates an object with curses array
   * @param cursos courses array
   */
  getCursosInfo(cursos:any)
  {
 
    const datePipe = new DatePipe('en-US');
    if(cursos)
    {
      return cursos.map(c => ({
        IdCurso: c.IdCursoId,
        FechaCurso: datePipe.transform(c.IdCurso.Fecha, 'dd-MM-yyyy'),
        Entrenador: c.IdCurso.Entrenador,
        NombreDFSE: c.Nombre,
        Descripcion: c.Descripcion,
        ComentariosContraparte: c.ComentariosContra,
        ComentariosFactory: c.ComentariosFactory,
        Documentos: c.Documentos,
        Usuario: c.UserId.Nombre,
        Email: c.UserId.Email,
        

      }))
    }
  }
  /**
   * gets cursos information data
   * @param cursos courses array
   */
  getCursosData(cursos: any[])
  {

    if(cursos.length>0)
    {
      const cursoinfo= cursos.map(c => this.excelService.getCursosInfo(c.IdCurso));
      return forkJoin(cursoinfo)
      .pipe(
        tap(curso => cursos.forEach((c,index)=> c.curso=curso[index])),
        map(()=>cursos)
      )
    }
    else
    {
      this.loading=false;
      return cursos;
    }
    
    

  }
  /**
   * gets Criteria information data
   * @param cursos courses array
   */
  getCriterioInfo(cursos:any[])
  {
    
    if(cursos.length>0)
    {
      const criterioinfo= cursos.map(c => this.excelService.getCriterioInfo(c.curso.value[0].CriterioId));
      return forkJoin(criterioinfo)
      .pipe(
        tap(criterio => cursos.forEach((c,index)=> c.criterio=criterio[index])),
        map(()=> cursos)
      )
    }
    return cursos;

  }
  /**
   * gets current user logged in
   */
  getCurrentUser()
  {
    this.sis.readCurrentUser().subscribe(res=>{
      console.log(res);
      this.dataCurrentUser=res;
      console.log(this.dataCurrentUser.Email);
      this.getUser();
    })
  }
  /**
   * Gets user information logged in
   */
  getUser()
  {
    const data={
      select:['Id','Nombre','Email','Rol/Nombre'],
      top:1,
      filter:["Email eq '" + (this.dataCurrentUser.Email ? this.dataCurrentUser.Email : this.dataCurrentUser.Title) + "'"],
      expand:['Rol']
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Usuarios', data)
    .pipe(
      map((users: any) => this.getUserInfo(users.value)),
    ).subscribe(r=>{
      console.log(r);
      this.dataUser=r;
        
    });//r=>this.getCourses());
  }
  /**
   * Creates an object of the user array
   * @param users user information array
   */
  getUserInfo(users: any[])
  {
    return users.map(r =>({
      id: r.Id,
      Nombre: r.Nombre,
      Email:r.Email,
      Rol: r.Rol.Nombre
    }));
  }
  /**
   * Initialize the form with controls and validations
   */
  private setupForm() {
    this.mainForm = this.fb.group({
      fecha1: [null,Validators.required],
      fecha2: [null,Validators.required],
    });
    this.minDate = new Date(this.currentYear,0,1);
    this.maxDate= new Date(this.currentYear,11,31);
  }

}
