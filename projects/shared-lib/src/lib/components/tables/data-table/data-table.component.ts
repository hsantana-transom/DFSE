import { Component, EventEmitter, OnInit, Input, ViewChild, AfterViewInit, Output } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Operation } from '../../../interfaces/operation';

@Component({
  selector: 'shared-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],

})
export class DataTableComponent implements AfterViewInit, OnInit {
  @Input() columns: any;
  @Input() dataSource: any;
  defaultOperations: Operation[] = [
    {
      label: 'Editar',
      matIcon: 'edit',
      operation: 'edit'
    },
    {
      label: 'Eliminar',
      matIcon: 'delete',
      operation: 'delete'
    }
  ];
  @Input() displayedColumns: any;
  @Input() operations: Operation[] = [];
  @Output() operationEvent = new EventEmitter();
  @Input() overrideOperations = false;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<any>;

  constructor( ) {}

  ngOnInit() {

    if (this.overrideOperations) {
      this.defaultOperations = this.operations;
    } else  {
      this.defaultOperations = [...this.defaultOperations, ...this.operations];
    }
  }

  ngAfterViewInit() {
    this.dataSource = this.dataSource;

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  // Custom public methods

  onOperation(item: any, operation: string) {
    this.operationEvent.emit({
      item,
      operation
    });
  }

}
