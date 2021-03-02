import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { FormsService, MessageService, SharepointIntegrationService } from 'shared-lib';
import {MainTableService} from './services/main-table.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { bandFileUp } from './uploadFile2.js';
import { ThrowStmt } from '@angular/compiler';
declare var uploadFile:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  mainForm: FormGroup;
  private isNew: boolean;
  file=null;
  bandFileUp=false;
  IdFecha;
  IdUser;
  url;
  dataCourse:any=[];
  dataUser:any=[];
  dataCurrentUser;
  files:any=[];
  bandUser=false;
  bandAprobador=false;
  dataEntrada;
  loading = false;
  filesString:string;
  bandFileRepeated=false;
  bandButtonFiles=false;
  bandButtonSave=false;
  bandButtonToApprove=false;
  bandButtonApproval=false
  bandButtonReject=false;
  bandUploadingFile=false;
  status;
  filesFolder:string;
  varFromJsFile;
  fechaAp;
  bandTest;
  intTime;
  constructor(
    private excelService:MainTableService,
    private sis: SharepointIntegrationService, 
    private fb: FormBuilder,
    private fs: FormsService,
    private message: MessageService,
    private snackbar: MatSnackBar
    )
  {
    localStorage.removeItem('fileUp');
    this.url=window.location.pathname.split('/');
    this.IdFecha= this.url[this.url.length - 1];
    this.IdUser= this.url[this.url.length - 2];
    this.getCurrentUser();
    this.varFromJsFile = window["bandFileUp"];
   
  }
  ngOnInit() {
    this.loading=true;
    
    this.filesFolder='Curso ' +  this.IdFecha + '-' + this.IdUser;
    this.getCourse();
    this.setupForm();
    
  }
  getEntrada()
  {
    const datePipe = new DatePipe('en-US');
    const data={
      select:['Nombre','Descripcion','ComentariosContra', 'Documentos','Id','ComentariosFactory','FechaEnAprobacion','Estatus'],
      top:1,
      filter:['IdFecha eq ' + this.IdFecha,'IdUser eq ' + this.IdUser],
    };
    this.sis.read('Entrada', data).subscribe(res=>{
      this.dataEntrada=res;
      if(this.dataEntrada.value.length>0)
      {
        this.dataEntrada=res;
        //console.log(this.dataEntrada);
        if(this.dataEntrada.value[0].Documentos!=null)
          this.files= this.dataEntrada.value[0].Documentos.split(',');
        this.mainForm.patchValue({
          id: this.dataEntrada.value[0].Id,
          description:this.dataEntrada.value[0].Descripcion,
          name: this.dataEntrada.value[0].Nombre,
          com1: this.dataEntrada.value[0].ComentariosContra,
          com2: this.dataEntrada.value[0].ComentariosFactory,
          
        });
        this.status=this.dataEntrada.value[0].Estatus;
        if(this.dataEntrada.value[0].FechaEnAprobacion != null)
          this.fechaAp= datePipe.transform(new Date(this.dataEntrada.value[0].FechaEnAprobacion), 'dd-MM-yyyy');
        //console.log(this.bandAprobador);
        //console.log(this.dataEntrada.value[0].Estatus)
        if(!this.bandAprobador || this.status!='Aprobación')
        {
          this.mainForm.get('description').disable();
          this.mainForm.get('name').disable();
          this.mainForm.get('com1').disable();
          this.mainForm.get('com2').disable();
        }
      }
      else
      {
        this.status='Draft';
        this.mainForm.get('description').disable();
        this.mainForm.get('name').disable();
        this.mainForm.get('com1').disable();
        this.mainForm.get('com2').disable();
      }
      this.checkButtonsFlags();
    });
  }
  checkButtonsFlags()
  {
    if(this.bandUser && (this.status=='Draft' || this.status=='Rechazado'))
    {
      console.log("Entre al 1");
      this.bandButtonFiles=true;
      this.bandButtonSave=true;
      this.bandButtonToApprove=true;
      this.bandButtonApproval=false
      this.bandButtonReject=false;
      this.mainForm.get('description').enable();
      this.mainForm.get('name').enable();
      this.mainForm.get('com1').enable();
      this.mainForm.get('com2').disable();
    }
    else if(this.bandAprobador && this.status=='Aprobación')
    {
      console.log("Entre al 2");
      this.bandButtonFiles=false;
      this.bandButtonSave=false;
      this.bandButtonToApprove=false;
      this.bandButtonApproval=true;
      this.bandButtonReject=true;
      this.mainForm.get('description').disable();
        this.mainForm.get('name').disable();
        this.mainForm.get('com1').disable();
        this.mainForm.get('com2').enable();
    }
    else if(!this.bandUser || (this.bandUser && this.status=='Aceptado'))
    {
      console.log("Entre al 3");
        this.bandButtonFiles=false;
        this.bandButtonSave=false;
        this.bandButtonToApprove=false;
        this.bandButtonApproval=false;
        this.bandButtonReject=false;
        this.mainForm.get('description').disable();
        this.mainForm.get('name').disable();
        this.mainForm.get('com1').disable();
        this.mainForm.get('com2').disable();
    }
    console.log("No entre a nada");
  }
  getCourse()
  {
    const data={
      select:['Fecha','Categoria/Categoria','Topico/Topico', 'Id','Nivel/Nivel','CriterioId','Periodo','Entrenador'],
      top:1,
      filter:['Id eq ' + this.IdFecha],
      expand:['Categoria','Topico','Nivel'],
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Fechas', data)
    .pipe(
      map((cursos: any) => this.getFechasInfo(cursos.value)),
    ).subscribe(response =>{
      console.log(response);
      response.forEach(c =>this.getCriterios(c))
    });
  }
  getFechasInfo(cursos:any[])
  {
    const datePipe = new DatePipe('en-US');
    return cursos.map(r =>({
      id: r.Id,
      Fecha: datePipe.transform(new Date(r.Fecha), 'dd-MM-yyyy'),
      Categoria:r.Categoria.Categoria,
      Nivel: r.Nivel.Nivel,
      Topico: r.Topico.Topico,
      CriterioId: r.CriterioId,
      Periodo: r.Periodo,
      Entrenador: r.Entrenador
    }))
  }
  getCriterios(c)
  {
    const data={
      select:['Id,Criterio'],
      top:1,
      filter: ['Id eq ' + c.CriterioId]
    };
      this.sis.read("Criterios",data).subscribe((response:any)=>{
        c.Criterio= response.value[0].Criterio
        this.dataCourse.push(c);
    })
  }
  getUser()
  {
    const data={
      select:['Id','Nombre','Email','EmailEscalacion'],
      top:1,
      filter:['Id eq ' + this.IdUser],
    };
    const datePipe = new DatePipe('en-US');
    this.sis.read('Usuarios', data)
    .pipe(
      map((response: any) => {
        response.value.map(r => {
          const item: any = {
            id: r.Id,
            Nombre: r.Nombre,
            Email:r.Email,
            EmailAprobador: r.EmailEscalacion
          };
          //item.fechaLabel= datePipe.transform(new Date(r.Fecha), 'dd-MM-yyyy');
          this.dataUser.push(item);
          //console.log('!!!!!!USUARIO!!!!!!!');
          //console.log(item);
          //console.log(this.dataCurrentUser);
          if(
            item.Email.toUpperCase()==this.dataCurrentUser.Email.toUpperCase() ||
            item.Email.toUpperCase()==this.dataCurrentUser.Title.toUpperCase()
            )
            this.bandUser=true;
          if(
            item.EmailAprobador.toUpperCase()==this.dataCurrentUser.Email.toUpperCase() || 
            item.EmailAprobador.toUpperCase()== this.dataCurrentUser.Title.toUpperCase()
          )
            this.bandAprobador=true;

          console.log("Usuario: " + this.bandUser);
          console.log("Aprobador: " + this.bandAprobador)
          this.getEntrada();
         
        })
      }),
    ).subscribe();
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
  disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  enableFields() {
    this.fs.enableFields(this.mainForm);
  }
  ngOnDestroy()
  {
    clearInterval(this.intTime);
    
  }
  readFile(event)
  {
    this.bandUploadingFile=true;
    console.log(event);
    const file= event.target.files[0].name;

    if(this.files.length>0)
    {
      for(var i=0; i<this.files.length;i++)
      {
        console.log(this.files[i]);
        if(this.files[i].trim()== file.trim())
        {
         
          this.bandFileRepeated=true;
          this.bandUploadingFile=false;
          break;
        }
        else
          this.bandFileRepeated=false;
      }
    }

    if(this.bandFileRepeated==false)
    {
      this.loading=true;
      this.snackbar.open('Subiendo Archivo...', null, { duration:1000 });
      uploadFile(file.name,this.filesFolder)
      this.intTime=setInterval(() =>{
        var bFile;
        bFile=localStorage.getItem('fileUp');
        console.log(bFile);
        this.snackbar.open('Subiendo Archivo...', null, { duration:1000 });
        if(bFile=='true')
        {
          this.snackbar.open('Archivo cargado correctamente!', null, { duration:1000 });
          this.files.push(file);
          clearInterval(this.intTime);
          this.bandUploadingFile=false;
          this.loading=false;
        }
        if(bFile=='false')
        {
          this.snackbar.open('Error al cargar el archivo.Intentalo de nuevo', null, { duration:1000 });
          this.bandUploadingFile=false;
          this.loading=false;
          clearInterval(this.intTime);

        }
      },2000)
      

      
    }
    
    //this.files.push(file);
    /*console.log(this.varFromJsFile);
    this.bandUploadingFile=true;
    this.loading=true;
    const file= event.target.files[0];
    var fileName= file.name;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () =>{
      this.file={
        name:fileName,
        content:reader.result
      }

    }
    console.log('this.file');
    console.log(file);
    console.log(reader);
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
          return this.sis.saveFile2(reader.result,formDigest, '4')
      })
    ).subscribe(r => {
      this.loading=false
    });
    */
/*
    //const reader = new FileReader();
    var fileName= file.name;
    
    console.log(fileName);

    if(this.files.length>0)
    {
      for(var i=0; i<this.files.length;i++)
      {
        console.log(this.files[i]);
        if(this.files[i].trim()== fileName.trim())
        {
         
          this.bandButtonToApprove=true;
          break;
        }
        else
          this.bandFileRepeated=false;
      }
    }
    if(this.bandFileRepeated==false)
    {
      console.log(file);
      readFile(file,fileName,this.filesFolder);
      
      setTimeout(() => {
        this.varFromJsFile = window["bandFileUp"];
        console.log(this.varFromJsFile);
        if(this.varFromJsFile==true)
        {
          reader.onload = () =>{
            this.file={
              name:fileName,
              content:reader.result
            }
          }
          reader.readAsArrayBuffer(file);
          this.files.push(fileName);
          console.log(this.files)
          this.bandUploadingFile=false;
          this.loading=false;
          this.snackbar.open('Archivo cargado correctamente', null, { duration:3000 });
        }
        if(this.varFromJsFile==false)
        {
          this.snackbar.open('Subiendo Archivo...', null, { duration:1000 });
          var timetowait;
          if(file.size>1048576 && file.size<2097152)
            timetowait=10000;
          if(file.size>2097152 && file.size<3145728)
            timetowait=20000;
          if(file.size>3145728 && file.size<4194304)
            timetowait=30000;
          if(file.size>4194304 && file.size<5242880)
            timetowait=35000;
          if(file.size>5242880 && file.size<10485760)
            timetowait= 60000
          if(file.size>10485760)
          timetowait= 120000

          setTimeout(() => {
            this.varFromJsFile = window["bandFileUp"];
            console.log(this.varFromJsFile);
            if(this.varFromJsFile==true)
            {
              reader.onload = () =>{
                this.file={
                  name:fileName,
                  content:reader.result
                }
              }
              reader.readAsArrayBuffer(file);
              this.files.push(fileName);
              console.log(this.files)
              this.bandUploadingFile=false;
              this.loading=false;
              this.snackbar.open('Archivo cargado correctamente', null, { duration:3000 });
            }
            else
            {
              this.bandUploadingFile=false;
              this.loading=false;
              this.snackbar.open('Error al subir el archivo, intentalo nuevamente', null, { duration:3000 });
            }
          }, timetowait);
        }
      }, 5000);
     
    }
    */
    
  }
  onDelete(index)
  {
    //console.log(index);
    this.file=null;
    //deleteFile(this.files[index]);
    this.files.splice(index,1);
    //console.log(this.files);

  }
  onSubmit(e)
  {
    this.loading=true;
    this.disableFields();

    const values = this.mainForm.value;
    this.filesString=this.files.join();
    console.log(this.filesString);
    const data:any={
      __metadata: { type: 'SP.Data.EntradaListItem' },
      Nombre:values.name,
      Descripcion:values.description,
      ComentariosContra: values.com1,
      ComentariosFactory: values.com2,
      Documentos: this.filesString,
      IdFecha: this.IdFecha,
      IdUser: this.IdUser,
      Aprobador:  this.dataUser[0].EmailAprobador,
      IdCursoId: this.IdFecha,
      UserIdId: this.IdUser,
    }
    switch(e)
    {
      case "guardar" : data.Estatus='Draft'
      break;
      case "aprobacion": 
      data.Estatus='Aprobación';
      var currentDate = new Date();
      data.FechaEnAprobacion= currentDate.toISOString();
      break;
      case "aprobado": data.Estatus='Aceptado'
      break;
      case "rechazado": data.Estatus='Rechazado'
      break;
    }
    if (values.id) {
      data.Id = values.id;
    }
    if(e=='aprobacion')
    {
      this.message.confirm({
        text: 'Solicitar aprobación?',
        title: 'Aprobación'
      }).subscribe(r =>{
        if(r)
        {
          return this.sis.getFormDigest().pipe(
            switchMap(formDigest => {
              return this.sis.save('Entrada',data,formDigest);
            })
          ).subscribe(r => {
            this.loading=false
          },
          err => this.message.genericHttpError(err),
          () =>
          {
            this.snackbar.open('Enviado a aprobación', null, { duration:3000 });
            window.location.href = '/sites/CC140991/';
          }
          );
        }
        else
          this.loading=false;
      })
    }
    else
    {
      return this.sis.getFormDigest().pipe(
        switchMap(formDigest => {
          return this.sis.save('Entrada',data,formDigest);
        })
      ).subscribe(r => {
        this.loading=false
      },
      err => this.message.genericHttpError(err),
      () => {
        switch (e)
        {
          case "guardar" :  this.snackbar.open('Elemento Guardado', null, { duration:3000 });
          break;
          case "aprobacion": this.snackbar.open('Enviado a aprobación', null, { duration:3000 });
          break;
          case "aprobado": this.snackbar.open('Aprobado', null, { duration:3000 });
          break;
          case "rechazado": this.snackbar.open('Rechazado', null, { duration:3000 });
          break;

        }
        window.location.href = '/sites/CC140991/';
      }
      );
    }
  }
  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      name: null,
      description:null,
      com1:null,
      com2:null,
      bandFile:null,
    });
    this.loading=false;
  }


}