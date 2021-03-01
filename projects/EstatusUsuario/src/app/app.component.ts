import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { FormGroup, FormBuilder, Validators, EmailValidator } from '@angular/forms';
import { MessageService } from 'shared-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  displayedColumns: string[] = ['Categoria', 'Nivel', 'Topico', 'Criterio','Porcentaje', 'Link'];
  displayedColumnsAprobador: string[] = ['usuario', 'email','curso','link'];
  dataSource;
  dataSourceAprobador;
  dataCourse:any=[];
  currentYear;
  dataCurrentUser;
  dataUser:any=[];
  evidencias:any=[];
  porcentajeGlobal=0;
  nCourses;
  dataEvidenciaAprobador:any=[];
  loading = false;
  constructor(
    private sis: SharepointIntegrationService, 
    private fb: FormBuilder,
    private fs: FormsService,
    private message: MessageService,
    private snackbar: MatSnackBar
    )
    {
      this.currentYear= new Date().getFullYear();
      this.getCurrentUser();
    }
  ngOnInit() {
    this.loading=true;
    /*const dataEvidencia={
      select:['Estatus', 'Id'],
      filter:['IdFecha eq 1','IdUser eq 2'],
    };
    this.sis.read('Entrada',dataEvidencia).subscribe(res=>console.log(res));
    */
  }
  ngAfterViewInit()
  {
    
  }
  getCourses()
  {
    const data={
      select:['Categoria/Categoria','Topico/Topico', 'Id','Nivel/Nivel','CriterioCorto','Periodo'],
      top:5000,
      filter:['Periodo eq ' + this.currentYear],
      expand:['Categoria','Topico','Nivel'],
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Fechas', data)
    .pipe(
      map((courses:any) => this.getCoursesInfo(courses.value)),
      //switchMap((courses) => this.getEvidencias(courses)),
    ).subscribe(response =>{
      console.log(response);
      this.dataSource=response;
      this.nCourses=response.length;
      this.dataSource.forEach((c,index) =>{
        this.getEvidencias(c,index);
      })
    });
  }
  getCoursesInfo(courses:any[])
  {
    return courses.map(course =>({
      Id:course.Id,
      Categoria: course.Categoria.Categoria,
      Nivel: course.Nivel.Nivel,
      Topico: course.Topico.Topico,
      Criterio: course.CriterioCorto

    }));
  }
  getEvidencias(course,i)
  {
    
    const dataEvidencia={
      select:['Estatus', 'Id','IdFecha'],
      filter:['IdFecha eq ' + course.Id,'IdUser eq ' + this.dataUser[0].id],
    };
    this.sis.read('Entrada',dataEvidencia)
    .subscribe(response =>{
      //console.log(response)
      this.evidencias= response;
      this.dataSource[i].evidencia= this.evidencias.value[0];
      this.dataSource[i].link= '/sites/CC140991/SitePages/FormEntrada.aspx/' + this.dataUser[0].id + '/' + course.Id; 
      if(this.evidencias.value.length>0)
      {
        if(this.evidencias.value[0].Estatus=="Aceptado")
        {
          this.dataSource[i].porcentaje='100';
          this.porcentajeGlobal= this.porcentajeGlobal + 100;
        }

        else
          this.dataSource[i].porcentaje='0'
      }
      else
        this.dataSource[i].porcentaje='0';
      this.loading=false;
    });
  }
  getCurrentUser()
  {
    this.sis.readCurrentUser().subscribe(res=>{
      console.log(res);
      this.dataCurrentUser=res;
      console.log(this.dataCurrentUser.Email);
      this.getUser();
    })
  }
  getUser()
  {
    const data={
      select:['Id','Nombre','Email','EmailEscalacion','Rol/Nombre'],
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
      if(this.dataUser[0].Rol=='USUARIO')
        this.getCourses();
      if(this.dataUser[0].Rol=='APROBADOR')
        this.getEvidenceToApprove();
        
    });//r=>this.getCourses());
  }
  getUserInfo(users: any[])
  {
    return users.map(r =>({
      id: r.Id,
      Nombre: r.Nombre,
      Email:r.Email,
      EmailAprobador: r.EmailEscalacion,
      Rol: r.Rol.Nombre
    }));
  }
  getEvidenceToApprove()
  {
    const dataEvidencia={
      select:['Estatus', 'Id','IdFecha','IdUser','UserId','UserId/Nombre','UserId/Email'],
      filter:["Aprobador eq '"  + this.dataUser[0].Email + "'","Estatus eq 'Aprobación'"],
      expand: ['UserId']
    };
    this.sis.read('Entrada',dataEvidencia)
    .pipe(
      map((evidencias:any) => this.getEvidenciasAprobadorInfo(evidencias.value)),
    ).subscribe(response =>{
      this.dataEvidenciaAprobador=response;
      console.log("dataEvidenciaAprobador");
      console.log(this.dataEvidenciaAprobador);
      /*
      if(this.dataEvidenciaAprobador.lenght>0)
      {
        this.dataEvidenciaAprobador.forEach((element, index) => {
          this.getUserInfoToAprobador(element,index);
        
        });
      }
      else{
        this.loading=false;
      }
      */
     this.loading=false;
    });

  }
  getUserInfoToAprobador(e,i)
  {
    const data={
      select:['Id','Nombre','Email'],
      top:1,
      filter:["Id eq '" + e.IdUser + "'"],
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Usuarios', data).pipe(
      map((user:any) => ({
        Nombre:user.value[0].Nombre,
        Email:user.value[0].Email,
      })),
    )
    .subscribe(r=>{
      console.log("DATOS USUARIO");
      console.log(r);
      this.dataEvidenciaAprobador[i].User= r;
      console.log(this.dataEvidenciaAprobador);
      this.loading=false;
    });
  }
  getEvidenciasAprobadorInfo(evidencias:any)
  {
    console.log("evidencias");

    console.log(evidencias);

    return evidencias.map(e =>({
      IdUser: e.IdUser,
      Id: e.Id,
      IdCurso: e.IdFecha,
      Nombre:e.UserId.Nombre,
      Email:e.UserId.Email,
      link: '/sites/CC140991/SitePages/FormEntrada.aspx/' + e.IdUser + "/" + e.IdFecha,
    }));
  }
}
