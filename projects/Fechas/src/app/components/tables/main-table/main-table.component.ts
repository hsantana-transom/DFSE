import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { MessageService, SharepointIntegrationService } from 'shared-lib';
import { MainFormDialogComponent } from '../../dialogs/main-form-dialog/main-form-dialog.component';
import { MainDataSource } from '../../../datasources/main-data-source';
import { MainTableService } from '../../../services/main-table.service';
import {FormGroup,FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss']
})
export class MainTableComponent implements OnInit {
  columns = COLUMNS;
  displayedColumns = ['fechaLabel','categoryName','levelName','topicName','criterioShort', 'operations'];
  dataSource: MainDataSource;
  loading = true;
  operationEdit;
  searchForm:FormGroup;
  bandClear=false;
  bandSearch=false;
  constructor(
    private dialog: MatDialog,
    private message: MessageService,
    private mts: MainTableService,
    private sis: SharepointIntegrationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.dataSource = this.mts.dataSource;
    this.setupForm();
    this.searchForm.get('search').valueChanges.subscribe(v=>{
      if(v.trim()!='')
      this.bandSearch=true;
      else
      this.bandSearch=false;
    })
    this.operationEdit=[
      {
        label:'Editar',
        matIcon:'edit',
        operation: 'edit'
      }
    ];
    this.mts.loadData()
      .subscribe(
        () => {},
        err => this.message.genericHttpError(err),
        () => this.loading = false
      );
  }
  setupForm()
  {
    this.searchForm= this.fb.group({
      search: null
    });
  }
  // Custom public methods

  onOperation(event) {
    switch (event.operation) {
      case 'delete':
        this.onDelete(event.item);
        break;
      case 'edit':
        this.onEdit(event.item);
        break;
    }
  }

  // Custom private methods

  private onDelete(item: any) {
    this.message.confirm({
      text: '¿Desea eliminar?',
      title: 'Eliminar'
    })
    .subscribe(response => {
      if (response) {
        this.sis.getFormDigest().pipe(
          switchMap(formDigest =>
            this.sis.delete('Fechas', item.id, formDigest)
          )
        )
        .subscribe(
          () => {
            this.message.show('Elemento eliminado');
            this.mts.loadData().subscribe();

          },
          err => this.message.genericHttpError(err)
        );
      }
    });
  }

  private onEdit(item: any) {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      data: item,
      disableClose: true,
      width:'50%'
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.message.genericSaveMessage();
        }
      });
  }
  SearchData()
  {
    const values = this.searchForm.value;
    var searchWord= values.search
    console.log(searchWord);
    this.mts.loadSearch(searchWord)
      .subscribe(
        () => {},
        err => this.message.genericHttpError(err),
        () => {this.loading = false; this.bandClear=true}
      );
  }
  clearSearch()
  {
    this.mts.loadData()
    .subscribe(
      () => {},
      err => this.message.genericHttpError(err),
      () => {
        this.loading = false; 
        this.bandClear=false;
        this.searchForm.get('search').setValue("");
      }
    );
  }

}
export const COLUMNS = [
  {
    key: 'createdLabel',
    label: 'Creado'
  },
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'fechaLabel',
    label: 'Fecha'
  },
  {
    key: 'categoryName',
    label: 'Categoría'
  },
  {
    key: 'levelName',
    label: 'Nivel'
  },
  {
    key: 'topicName',
    label: 'Tópico'
  },
  {
    key: 'criterioShort',
    label: 'Criterio'
  },

];

