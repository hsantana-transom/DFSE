import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from '../../../services/main-table.service';

/**
 * Main Form Component
 */
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
  bandDuplicado=false;
  bandDuplicadoCode=false;
  allData:[]=[];
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;
    this.setupForm();
    this.getAllData();
    /*this.mainForm.get("name").valueChanges.subscribe(v=>{
      this.checkDuplicate(v,"name");
    });
    this.mainForm.get("code").valueChanges.subscribe(v=>{
      this.checkDuplicate(v,"code");
    });
  */
  }
  // Custom public methods
    /**
   * Gets all Region items
   */
  getAllData()
  {
    const data={
      select:['Id,Region,Codigo'],
      top:5000
    };
    this.sis.read("Regiones",data).subscribe((response:any)=>{
      if(response)
      {
        this.allData=response.value;
      }
    });
  }

  /**
   * Checks for duplicated items
   * @param newCriteria new Region item
   * @param verifyString String to check 
   */
  checkDuplicate(newCriteria:string,verifyString:string)
  {
    console.log(newCriteria);
    console.log(this.allData);
    console.log(this.data);
    if(verifyString== 'name')
    {
      for(var i=0; i<this.allData.length; i++)
      {
        if(this.allData[i]['Region'] === newCriteria.toUpperCase()) 
        {
          if(this.isNew)
          {
            this.bandDuplicado= true;
            break;
          }
          else
          {
            console.log(this.data.id);
            if(this.data.id!= this.allData[i]['Id'])
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
    if(verifyString == 'code')
    {
      for(var i=0; i<this.allData.length; i++)
      {
        if(this.allData[i]['Codigo'] === newCriteria.toUpperCase()) 
        {
          if(this.isNew)
          {
            this.bandDuplicadoCode= true;
            break;
          }
          else
          {
            console.log(this.data.id);
            if(this.data.id!= this.allData[i]['Id'])
            {
              this.bandDuplicadoCode= true;
              break;
            }
          }
          
          
        }
        else
        {
          this.bandDuplicadoCode=false;
        }
      }
    }
  }
  
  /**
   * Disable all controls on the form
   */
  disableFields() {
    this.fs.disableFields(this.mainForm);
  }
  /**
   * enable all controls on the form
   */
  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  /**
   * Submits Region information introduced by the users
   */
  submit() {
    const values = this.mainForm.value;
    const data: any = {
      __metadata: { type: 'SP.Data.RegionesListItem' },
      Region: values.name.toUpperCase(),
      Codigo: values.code.toUpperCase(),
      Estatus: values.status,
      Pais: values.country ? values.country.toUpperCase() : null
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        console.log(data);
        return this.sis.save('Regiones', data, formDigest);
      })
    );
  }
   // Custom private methods
  /**
   * Setups the form with its validations for each control 
   */
  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      name: [null, Validators.required],
      code: [null, Validators.required],
      status: [null, Validators.required],
      country: null,
    });
    if (!this.isNew) {
      console.log(this.data);
      this.mainForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        code: this.data.code,
        status: this.data.status,
        country: this.data.country
      });
    }
  }

}
