import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from '../../../services/main-table.service';
import { DatePipe } from '@angular/common';
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
  categories:any[]=[];
  topics:any[]=[];
  levels:any[]=[];
  criterias:any[]=[];
  bandFechas=false;
  categoryText:string;
  topicText:string;
  levelText:string;
  criteriaText:string;
  yearSelected:number;
  fechaString:string;
  minDate: Date;
  shortCriterio:string;
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) { 
    //this.getCriteriaText();
  }

  ngOnInit() {
    const datePipe = new DatePipe('en-US');
    this.isNew = this.data ? false : true;
    
    this.getCategories();
    this.getTopics();
    this.getLevels();
    this.getCriterias();
    this.getAllData();
    this.setupForm();
    this.mainForm.get('fecha').valueChanges.subscribe(v =>{
      this.yearSelected= new Date(v).getFullYear();
      this.fechaString= datePipe.transform(new Date(v), 'dd-MM-yyyy');
      this.checkDuplicate(v.toISOString());
    });
    
  }
  // Custom public methods
  
  getAllData()
  {
    const data={
      select:['Id,Fecha'],
      top:5000
    };
    this.sis.read("Fechas",data).subscribe((response:any)=>{
      if(response)
      {
        this.allData=response.value;
        console.log(this.allData);
      }
    });
  }
  checkDuplicate(newFecha:string)
  {
    console.log(newFecha);
    //console.log(this.allData);
    
    for(var i=0; i<this.allData.length; i++)
    {
      //console.log(this.allData[i]['Fecha'] );
      var oldDate: string = this.allData[i]['Fecha'];
      oldDate= oldDate.substring(0,10);
      console.log(oldDate);
      if(oldDate === newFecha.substring(0,10)) 
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
  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.keywords.push(value.trim());
      this.mainForm.markAsDirty();

    }
    if (input) {
      input.value = '';
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

  removeKeyword(keyword: any) {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.mainForm.markAsDirty();
  }

  submit() {
    const values = this.mainForm.value;
    const data: any = {
      __metadata: { type: 'SP.Data.FechasListItem' },
      Fecha: values.fecha.toISOString(),
      CategoriaId:values.category,
      TopicoId: values.topic,
      NivelId: values.level,
      CriterioId: values.criteria,
      Periodo: this.yearSelected.toString(),
      fechaString: this.fechaString,
      CriterioCorto: this.shortCriterio,
      //FechaInicial: values.fechaI.toISOString(),
      //FechaFinal: values.fechaF.toISOString()
    };

    if (values.id) {
      data.Id = values.id;
    }
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        console.log(data);
        return this.sis.save('Fechas', data, formDigest);
      })
    );
  }
   // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      fecha: [null,Validators.required],
      category: [null, Validators.required],
      topic: [null, Validators.required],
      level: [null, Validators.required],
      criteria: [null, Validators.required],

    });
 
    this.minDate= new Date();
    //console.log("Fecha Actual: " + this.minDate);
    if (!this.isNew) {
      console.log(this.data);
      this.fechaString=this.data.fechaLabel;
      this.categoryText= this.data.categoryName;
      this.topicText= this.data.topicName;
      this.levelText= this.data.levelName;
      this.criteriaText= this.data.criterioShort;
      this.shortCriterio= this.data.criterioShort;
      this.mainForm.patchValue({
        id: this.data.id,
        fecha: this.data.fecha,
        category: this.data.category,
        level: this.data.level,
        topic: this.data.topic,
        criteria: this.data.criteria
      });
    }
  }
  getCategories()
  {
    const data={
      select:['Id,Categoria'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\'']
    };
    this.sis.read("Categorias",data).subscribe((response:any)=>{
      if(response)
      {
        this.categories=response.value;
        if(!this.isNew)
          this.checkCategory()
      }
    });

  }
  getTopics()
  {
    const data={
      select:['Id,Topico'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\'']
    };
    this.sis.read("Topicos",data).subscribe((response:any)=>{
      if(response)
      {
        this.topics=response.value;
        if(!this.isNew)
          this.checkTopic()
      }
    });
  }
  getLevels()
  {
    const data={
      select:['Id,Nivel'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\'']
    };
    this.sis.read("Niveles",data).subscribe((response:any)=>{
      if(response)
      {
        this.levels=response.value;
        if(!this.isNew)
          this.checkLevel();
      }
    });
  }
  getCriterias()
  {
    const data={
      select:['Id,Criterio'],
      top:5000,
      filter: ['Estatus eq \'ACTIVO\'']
    };
    this.sis.read("Criterios",data).subscribe((response:any)=>{
      if(response)
      {
        this.criterias=response.value;
        if(!this.isNew)
          this.checkCriteria();
      }
    });
  }
  getSelectedCategory(event)
  {
    this.categoryText=event.source.triggerValue
  }
  getSelectedTopic(event)
  {
    this.topicText=event.source.triggerValue
    
  }
  getSelectedLevel(event)
  {
    this.levelText=event.source.triggerValue
  }
  getSelectedCriteria(event)
  {
    this.criteriaText=event.source.triggerValue
    if(this.criteriaText.length > 100)
      this.shortCriterio= this.criteriaText.substring(0,100) + '...'
    else
      this.shortCriterio= this.criteriaText

  }
  checkCategory()
  {
    const data={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.category]
    };
    this.sis.read("Categorias",data).subscribe((response:any)=>{
      if(response)
      {
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.categories.push({Id: this.data.category,Categoria: this.data.categoryName})
        }
      }
    })
  }
  checkTopic()
  {
    const data={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.topic]
    };
    this.sis.read("Topicos",data).subscribe((response:any)=>{
      if(response)
      {
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.topics.push({Id: this.data.topic,Topico: this.data.topicName})
        }
      }
    })
  }
  checkLevel()
  {
    const data={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.level]
    };
    this.sis.read("Niveles",data).subscribe((response:any)=>{
      if(response)
      {
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.levels.push({Id: this.data.level,Nivel: this.data.levelName})
        }
      }
    })
  }
  checkCriteria()
  {
    const data={
      select:['Id,Estatus'],
      top:1,
      filter: ['Id eq ' + this.data.criteria]
    };
    this.sis.read("Criterios",data).subscribe((response:any)=>{
      if(response)
      {
        if(response.value[0].Estatus=="INACTIVO")
        {
          this.criterias.push({Id: this.data.criteria,Criterio: this.data.criteriaName})
        }
      }
    })
  }
  getCriteriaText()
  {
    for(var i=0; i<this.data.length; i++)
    {
      const data={
        select:['Id,Criterio'],
        top:1,
        filter: ['Id eq ' + this.data[i].criteria]
      };
      this.sis.read("Criterios",data).subscribe((response:any)=>{
        this.data[i].criteriaName=response.value[0].Criterio
      })
    }

    }
    

}
