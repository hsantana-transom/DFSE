import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from '../../../services/main-table.service';
import { DatePipe } from '@angular/common';

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
  allData:[]=[];
  bandFechas=false;
  minDate: Date;
  fechaIString:string;
  fechaFString:string;

  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) { }

  ngOnInit() {
    const datePipe = new DatePipe('en-US');
    this.isNew = this.data ? false : true;
    this.setupForm();
    this.getAllData();
    this.mainForm.get("name").valueChanges.subscribe(v=>{
      this.checkDuplicate(v);
    });
    this.mainForm.get("fechaF").valueChanges.subscribe(v=>{
      this.fechaFString=datePipe.transform(new Date(v), 'dd-MM-yyyy');
      this.verificaFechas();
    });
    this.mainForm.get("fechaI").valueChanges.subscribe(v=>{
      this.fechaIString=datePipe.transform(new Date(v), 'dd-MM-yyyy');
      this.verificaFechas();
    });
  }
  // Custom public methods
  /**
   * checks Dates
   */
  verificaFechas()
  {
    if(this.mainForm.get('fechaI').value != null && this.mainForm.get('fechaF').value != null)
    {
      if(this.mainForm.get('fechaI').value > this.mainForm.get('fechaF').value)
        this.bandFechas=true;
      else
        this.bandFechas=false;
    }
  }
  /**
   * Gets all Period items
   */
  getAllData()
  {
    const data={
      select:['Id,Periodo'],
      top:5000
    };
    this.sis.read("Periodos",data).subscribe((response:any)=>{
      if(response)
      {
        this.allData=response.value;
      }
    });
  }
    /**
   * Checks for duplicated items
   * @param newCriteria new Period item
   */
  checkDuplicate(newCriteria:string)
  {
    console.log(newCriteria);
    console.log(this.allData);
    console.log(this.data);
    for(var i=0; i<this.allData.length; i++)
    {
      if(this.allData[i]['Periodo'] === newCriteria.toUpperCase()) 
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
   * Submits Level information introduced by the users
   */
  submit() {
    const values = this.mainForm.value;
    const data: any = {
      __metadata: { type: 'SP.Data.PeriodosListItem' },
      Periodo: values.name.toUpperCase(),
      FechaInicial: values.fechaI.toISOString(),
      FechaFinal: values.fechaF.toISOString(),
      FechaInicialString: this.fechaIString,
      FechaFinalString: this.fechaFString
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        console.log(data);
        return this.sis.save('Periodos', data, formDigest);
      })
    );
  }
   // Custom private methods
  /**
   * Setups the form with its validations for each control 
   */
  private setupForm() {
    
    const currentYear = new Date().getFullYear();
    console.log('current year' + currentYear);
    this.minDate = new Date(currentYear,0,1);
    console.log('Fecha min:' + this.minDate);
    this.mainForm = this.fb.group({
      id: null,
      name: [null, [Validators.required,Validators.pattern(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)]],
      fechaI: [null, Validators.required],
      fechaF: [null, Validators.required],
    });
    if (!this.isNew) {
      console.log(this.data);
      this.fechaIString= this.data.fechaILabel;
      this.fechaFString= this.data.fechaFLabel
      this.mainForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        fechaI: this.data.fechaI,
        fechaF: this.data.fechaF
      });
    }
  }

  /**
   * gets period name
   */
  get periodo()
  {
    return this.mainForm.get('name');
  }

}
