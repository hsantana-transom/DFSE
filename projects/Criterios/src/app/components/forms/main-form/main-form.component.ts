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
  allCriteria:[]=[];
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;
    this.setupForm();
    this.getAllCriteria();
    this.mainForm.get("name").valueChanges.subscribe(v=>{
      this.checkDuplicate(v);
    })
  }

  // Custom public methods
    
  /**
   * Gets all Criteria items
   */
  getAllCriteria()
  {
    const data={
      select:['Id,Criterio'],
      top:5000
    };
    this.sis.read("Criterios",data).subscribe((response:any)=>{
      if(response)
      {
        this.allCriteria=response.value;
      }
    });
  }

   /**
   * Checks for duplicated items
   * @param newCriteria new Criteria item
   */
  checkDuplicate(newCriteria:string)
  {
    console.log(newCriteria);
    console.log(this.allCriteria);
    console.log(this.data);
    for(var i=0; i<this.allCriteria.length; i++)
    {
      if(this.allCriteria[i]['Criterio'] === newCriteria.toUpperCase()) 
      {
        if(this.isNew)
        {
          this.bandDuplicado= true;
          break;
        }
        else
        {
          console.log(this.data.id);
          if(this.data.id!= this.allCriteria[i]['Id'])
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
   * Submits Criteria information introduced by the users
   */
  submit() {
    const values = this.mainForm.value;
    var shortCriterio;
    if(values.name.length > 200)
    shortCriterio= values.name.substring(0,200) + '...'
    else
      shortCriterio= values.name;
    const data: any = {
      __metadata: { type: 'SP.Data.CriteriosListItem' },
      Criterio: values.name.toUpperCase(),
      CriterioCorto: shortCriterio.toUpperCase(),
      Estatus: values.status
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        console.log(data);
        return this.sis.save('Criterios', data, formDigest);
      })
    );
  }

  // Custom private methods
  /**
   * Setups the form with its validatios for each control 
   */
  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      name: [null, Validators.required],
      status: [null, Validators.required],
    });
    if (!this.isNew) {
      console.log(this.data);
      this.mainForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        status: this.data.status
      });
    }
  }

}
