import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { MessageService, SharepointIntegrationService } from 'shared-lib';
import { MainFormDialogComponent } from '../../dialogs/main-form-dialog/main-form-dialog.component';
import { MainDataSource } from '../../../datasources/main-data-source';
import { MainTableService } from '../../../services/main-table.service';
import {FormGroup,FormBuilder} from '@angular/forms';

/**
 * main table component
 */
@Component({
  selector: 'app-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss']
})
export class MainTableComponent implements OnInit {
  columns = COLUMNS;
  displayedColumns = ['id', 'name','status', 'operations'];
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
    this.operationEdit=[
      {
        label:'Editar',
        matIcon:'edit',
        operation: 'edit'
      }
    ];
    this.searchForm.get('search').valueChanges.subscribe(v =>{
      if(v.trim()!='')
        this.bandSearch=true;
      else
        this.bandSearch=false;
    });
    if(this.bandClear==false)
    {
    this.mts.loadData()
      .subscribe(
        () => {},
        err => this.message.genericHttpError(err),
        () => this.loading = false
      );
    }
    else
    {
      this.SearchData();
    }
  }
  /**
   * setup for serch control
   */
  setupForm()
  {
    this.searchForm= this.fb.group({
      search: null
    });
  }
  // Custom public methods
  /**
   * calls event whether the user clicks edit or delete on the table
   */
  onOperation(event) {
    switch (event.operation) {
     /* case 'delete':
        this.onDelete(event.item);
        break;
      */
      case 'edit':
        this.onEdit(event.item);
        break;
    }
  }

  // Custom private methods
  /**
   * Deletes a Topic Item
   * @param item item to delete
   */
  private onDelete(item: any) {
    this.message.confirm({
      text: '¿Desea eliminar?',
      title: 'Eliminar'
    })
    .subscribe(response => {
      if (response) {
        this.sis.getFormDigest().pipe(
          switchMap(formDigest =>
            this.sis.delete('Topicos', item.id, formDigest)
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
  /**
   * Opens Form Dialog with item information to edit
   * @param item item to edit 
   */
  private onEdit(item: any) {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      data: item,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.message.genericSaveMessage();
        }
      });
  }
  /**
   * Gets Topic Data filtered by the search string
   */
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
  /**
   * clears search Data
   */
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
/**
 * Columns to show in the table
 */
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
    key: 'name',
    label: 'Topico'
  },
  {
    key: 'status',
    label: 'Estatus'
  },
];


