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
  allData:[]=[];
  bandDuplicado=false;

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
    this.mainForm.get("name").valueChanges.subscribe(v=>{
      this.checkDuplicate(v);
    })
  }

  // Custom public methods
   /**
   * Gets all Topic items
   */
  getAllData()
  {
    const data={
      select:['Id,Topico'],
      top:5000
    };
    this.sis.read("Topicos",data).subscribe((response:any)=>{
      if(response)
      {
        this.allData=response.value;
      }
    });
  }

  /**
   * Checks for duplicated items
   * @param newCriteria new Topic item
   */
  checkDuplicate(newString:string)
  {
   
    for(var i=0; i<this.allData.length; i++)
    {
      if(this.allData[i]['Topico'] === newString.toUpperCase()) 
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
   * Submits Topic information introduced by the users
   */
  submit() {
    const values = this.mainForm.value;
    const data: any = {
      __metadata: { type: 'SP.Data.TopicosListItem' },
      Topico: values.name.toUpperCase(),
      Estatus: values.status
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        console.log(data);
        return this.sis.save('Topicos', data, formDigest);
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
