import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from '../../../services/main-table.service';
import {of,forkJoin} from 'rxjs';
@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {
  @Input() data: any;
  fields: any = {};
  flags = {
    loadingFields: true
  };
  private isNew: boolean;
  keywords: string[] = [];
  usedOrders: number[] = [];
  avaliableOrders: number[]=[];
  mainForm: FormGroup;
  mainImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  checkButton = false;
  orderCheck = false;
  found = false;
  nItems = 0;
  checkTitle = false;
  oldOrder = null;
  bandLink = false;
  allData:[]=[];
  LoginData:[]=[];
  roles:any[]=[];
  regiones:any[]=[];
  userInfo:any;
  bandDuplicado=false;
  bandDuplicadoEmail=false;
  bandTipo=false;
  SelectedRol: string;
  oldRol:string;
  filteredOptions: Observable<string[]>;
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;
    this.getAllData();
    this.getRegiones();
    this.getRoles();
    this.setupForm();
    
    this.mainForm.get("wwid").valueChanges.subscribe(v=>{
      if(v!=null)
        this.checkDuplicate(v,'wwid');
    });
    this.mainForm.get("email").valueChanges.subscribe(v=>{
      this.checkDuplicate(v,'email');
    })
  }
  // Custom public methods
  getAllData()
  {
    const data={
      select:['Id,WWID','Email'],
      top:5000
    };
    this.sis.read("Usuarios",data).subscribe((response:any)=>{
      if(response)
      {
        this.allData=response.value;
        console.log(this.allData);
      }
    });
  }
  
  checkDuplicate(newString:string, validador:string)
  {
    if(validador=='wwid')
    {
      for(var i=0; i<this.allData.length; i++)
      {
        if(this.allData[i]['WWID'] === newString.toUpperCase()) 
        {
          if(this.isNew)
          {
            this.bandDuplicado= true;
            break;
          }
          else
          {
            if(this.data.id != this.allData[i]['Id'])
            {
              this.bandDuplicado= true;
              break;
            }
          }
        }
        else
        {
          this.bandDuplicado=false;
        }
      }
    }
    else
    {
      for(var i=0; i<this.allData.length; i++)
      {
        if(this.allData[i]['Email'] === newString.toUpperCase()) 
        {
          if(this.isNew)
          {
            this.bandDuplicadoEmail= true;
            break;
          }
          else
          {
            if(this.data.id != this.allData[i]['Id'])
            {
              this.bandDuplicadoEmail= true;
              break;
            }
          }
        }
        else
        {
          this.bandDuplicadoEmail=false;
        }
      }
    }
    
  }
  

  disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  onFileEvent(event: ImageFile, type: string) {
    switch (type) {
      case 'main':
        this.mainImage = event;
        break;
    }
  }


  submit() {
    const values = this.mainForm.value;
    const data: any = {
      __metadata: { type: 'SP.Data.UsuariosListItem' },
      WWID: values.wwid ? values.wwid.toUpperCase() : null,
      Nombre: values.name.toUpperCase(),
      Email:values.email.toUpperCase(),
      Escalacion:values.supervisor.toUpperCase(),
      EmailEscalacion: values.emailSupervisor.toUpperCase(),
      RolId: values.rol,
      CodigoRegionId: values.region,
      WWIDSupervisor: values.wwidSupervisor ? values.wwidSupervisor.toUpperCase() : null,
      Estatus: values.status,
      Tipo: values.tipo

    };
    console.log(this.oldRol);
    console.log(this.SelectedRol);

    if (values.id) {
      data.Id = values.id;
    }
    var dataLogin: any;
    if(values.status=='ACTIVO')
    {
      if(this.SelectedRol=='APROBADOR')
      {
        if(values.tipo=='INTERNO')
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            //LoginName: 'i:05.t|adfs-spprd|' + values.Email,
            LoginName: 'i:0#.w|ced\\' + values.wwid,
            //Title: values.title
          };
        
            return this.sis.getFormDigest()
            .pipe(
              map(formDigest => {
                return [
                  of(formDigest),
                  this.sis.saveUserInGroup('5', dataLogin, formDigest)
                ];
              }),
              switchMap(requests => forkJoin(requests)),
              map(([formDigest])=>{
                this.sis.save("Usuarios",data,formDigest).subscribe(res =>{
                  console.log(values.wwid);
                  if(this.oldRol != this.SelectedRol)
                  {
                    this.sis.readUserFromGroup('7', values.wwid).subscribe(resp =>{
                      this.userInfo=resp;
                      this.sis.deleteUserFromGroup('7',this.userInfo.value[0].Email,formDigest).subscribe();
                    })
                  }
                })
              }),
            );
          
        }
        else
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            LoginName: 'i:05.t|adfs-spprd|' + values.email,
            //Title: values.title
          };
          return this.sis.getFormDigest()
          .pipe(
            map(formDigest => {
              return [
                of(formDigest),
                this.sis.saveUserInGroup('5', dataLogin, formDigest)
              ];
            }),
            switchMap(requests => forkJoin(requests)),
            map(([formDigest])=>{
              this.sis.save("Usuarios",data,formDigest).subscribe(res =>{
                if(this.oldRol != this.SelectedRol)
                  this.sis.deleteUserFromGroup('7',data.Email,formDigest).subscribe();
              })
            }),
          );
        }
      }
      else
      {
        if(values.tipo=='INTERNO')
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            //LoginName: 'i:05.t|adfs-spprd|' + values.Email,
            LoginName: 'i:0#.w|ced\\' + values.wwid,
            //Title: values.title
          };
            return this.sis.getFormDigest()
            .pipe(
              map(formDigest => {
                return [
                  of(formDigest),
                  this.sis.saveUserInGroup('7', dataLogin, formDigest)
                ];
              }),
              switchMap(requests => forkJoin(requests)),
              map(([formDigest])=>{
                this.sis.save("Usuarios",data,formDigest).subscribe(res =>{
                  if(this.oldRol != this.SelectedRol)
                  {
                    this.sis.readUserFromGroup('5', values.wwid).subscribe(resp =>{
                      this.userInfo=resp;
                      this.sis.deleteUserFromGroup('5',this.userInfo.value[0].Email,formDigest).subscribe();
                    })
                  }
                });
              })
            );
        
        }
        else
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            LoginName: 'i:05.t|adfs-spprd|' + values.email,
            //Title: values.title
          };
          return this.sis.getFormDigest()
        .pipe(
          map(formDigest => {
            return [
              of(formDigest),
              this.sis.saveUserInGroup('7', dataLogin, formDigest)
            ];
          }),
          switchMap(requests => forkJoin(requests)),
          map(([formDigest])=>{
            this.sis.save("Usuarios",data,formDigest).subscribe(res =>{
              if(this.oldRol != this.SelectedRol)
                this.sis.deleteUserFromGroup('5',data.Email,formDigest).subscribe();
            });
          })
        );
        }
      }
    }
    /*
    ----------------------------------------------------
        Si se Inactiva el usuario
    -----------------------------------------------------
    */
    else
    {
      if(this.SelectedRol=='APROBADOR')
      {
        if(values.tipo=='INTERNO')
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            //LoginName: 'i:05.t|adfs-spprd|' + values.Email,
            LoginName: 'i:0#.w|ced\\' + values.wwid,
            //Title: values.title
          };
        
            return this.sis.getFormDigest()
            .pipe(
              map(formDigest => {
                return [
                  of(formDigest),
                  this.sis.save('Usuarios', data, formDigest)
                ];
              }),
              switchMap(requests => forkJoin(requests)),
              map(([formDigest])=>{
                if(!this.isNew)
                {
                  this.sis.readUserFromGroup('5', values.wwid).subscribe(res =>{
                    this.userInfo=res;
                    this.sis.deleteUserFromGroup('5',this.userInfo.value[0].Email,formDigest).subscribe();
                  })
                }
              }),
            );
          
        }
        else
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            LoginName: 'i:05.t|adfs-spprd|' + values.email,
            //Title: values.title
          };
          return this.sis.getFormDigest()
          .pipe(
            map(formDigest => {
              return [
                of(formDigest),
                this.sis.save("Usuarios",data,formDigest)
              ];
            }),
            switchMap(requests => forkJoin(requests)),
            map(([formDigest])=>{
              if(!this.isNew)
                this.sis.deleteUserFromGroup('5',data.Email,formDigest).subscribe();
            }),
          );
        }
      }
      else
      {
        if(values.tipo=='INTERNO')
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            //LoginName: 'i:05.t|adfs-spprd|' + values.Email,
            LoginName: 'i:0#.w|ced\\' + values.wwid,
            //Title: values.title
          };
            return this.sis.getFormDigest()
            .pipe(
              map(formDigest => {
                return [
                  of(formDigest),
                  this.sis.save("Usuarios",data,formDigest)
                ];
              }),
              switchMap(requests => forkJoin(requests)),
              map(([formDigest])=>{
                if(!this.isNew)
                {
                  this.sis.readUserFromGroup('7', values.wwid).subscribe(res =>{
                    this.userInfo=res;
                    this.sis.deleteUserFromGroup('7',this.userInfo.value[0].Email,formDigest).subscribe();  
                  });
                }
              })
            );
        
        }
        else
        {
          dataLogin = {
            //__metadata: { type: 'SP.Data.AngularTestListItem' },
            __metadata: { type: 'SP.User' },
            LoginName: 'i:05.t|adfs-spprd|' + values.email,
            //Title: values.title
          };
          return this.sis.getFormDigest()
        .pipe(
          map(formDigest => {
            return [
              of(formDigest),
              this.sis.save("Usuarios",data,formDigest)
            ];
          }),
          switchMap(requests => forkJoin(requests)),
          map(([formDigest])=>{
            if(!this.isNew)
              this.sis.deleteUserFromGroup('7',data.Email,formDigest).subscribe();
          })
        );
        }
      }
    }
  }

   // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      name: [null, Validators.required],
      wwid: null,
      email: [null, [Validators.required,Validators.email]],
      supervisor: [null, Validators.required],
      emailSupervisor: [null, [Validators.required,Validators.email]],
      region: [null, Validators.required],
      rol: [null, Validators.required],
      tipo: [null, Validators.required],
      status: [null, Validators.required],
      wwidSupervisor: null

    });
    
   
    if (!this.isNew) {
      if(this.data.tipo=='INTERNO')
      {
        this.bandTipo=true;
        this.mainForm.get('wwid').setValidators(Validators.required);
        this.mainForm.get('wwid').updateValueAndValidity();
      }
      this.SelectedRol=this.data.rolName;
      this.oldRol=this.data.rolName;
      console.log(this.data);
      this.mainForm.patchValue({
        id: this.data.id,
        wwid: this.data.wwid,
        name: this.data.name,
        email: this.data.email,
        supervisor: this.data.supervisor,
        emailSupervisor: this.data.emailSupervisor,
        region: this.data.regionCode,
        rol: this.data.rol,
        wwidSupervisor: this.data.wwidSupervisor,
        tipo: this.data.tipo,
        status: this.data.status
      });
      
    }
  }
  checkRole()
  {
    const dataRoles={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.rol]
    };
    this.sis.read("Roles",dataRoles).subscribe((response:any)=>{
      if(response)
      {
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.roles.push({Id: this.data.rol,Nombre: this.data.rolName})
        }
      }
    })
  }
  checkRegion()
  {
    const data={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.regionCode]
    };
    this.sis.read("Regiones",data).subscribe((response:any)=>{
      if(response)
      {
        console.log(response);
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.regiones.push({Id: this.data.regionCode,Codigo: this.data.regionName})
          console.log(this.regiones);
        }
      }
    })
  }
  getRoles()
  {
    const data={
      select:['Id,Nombre'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\'']
    };
    this.sis.read("Roles",data).subscribe((response:any)=>{
      if(response)
      {
        this.roles=response.value;
        if(!this.isNew)
          this.checkRole();
      }
    });
    
  }
  getRegiones()
  {
    const data={
      select:['Id,Codigo,Pais'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\''],
      
    };
    this.sis.read("Regiones",data).subscribe((response:any)=>{
      if(response)
      {
        this.regiones = response.value
        
        //this.regiones=response.value;
        if(!this.isNew)
          this.checkRegion();
      }
    });
  }
  VerifyType(e)
  {
    if(e=="INTERNO")
    {
      this.bandTipo=true;
      this.mainForm.get('wwid').setValidators(Validators.required);
      this.mainForm.get('wwid').updateValueAndValidity();
    }
    if(e=="EXTERNO")
    {
      this.mainForm.get('wwid').clearValidators();
      this.mainForm.get('wwid').updateValueAndValidity();
      this.bandTipo=false;
    }
  }
  getSelectedRol(e)
  {
    this.SelectedRol=e.source.triggerValue
    //console.log(this.SelectedRol);
    if(this.isNew)
      this.oldRol= this.SelectedRol;

  }
  get userEmail()
  {
    return this.mainForm.get('email');
  }
  get superEmail()
  {
    return this.mainForm.get('emailSupervisor');
  }
}

