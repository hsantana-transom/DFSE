import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainTableDataSource } from '../datasources/main-table.datasource';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {
  dataSource: MainTableDataSource;

  constructor(
    private sis: SharepointIntegrationService
  ) {
    this.dataSource = new MainTableDataSource();
  }

  clearAll() {
    this.dataSource.clearAll();
  }

  loadData() {
    const data = {
      select: ['Descripcion', 'Fechanoticia', 'Id', 'Orden', 'Title', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Noticias', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              order: r.Orden,
              newsDate: new Date(r.Fechanoticia),
              summary: r.Descripcion,
              title: r.Title
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.newsDateLabel = datePipe.transform(item.newsDate, 'yyyy-MM-dd hh:mm a');

            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
