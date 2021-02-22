import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainDataSource } from '../datasources/main-data-source';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {

  dataSource: MainDataSource;
  constructor(private sis: SharepointIntegrationService) {
    this.dataSource = new MainDataSource();
  }
  clearAll() {
    this.dataSource.clearAll();
  }
  loadData() {
    const data = {
      select: ['Nivel', 'Id', 'Estatus', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Niveles', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Nivel,
              status: r.Estatus
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
  loadSearch(search) {
    var fields=['Id','Nivel','Estatus']
    const data = {
      select: ['Nivel', 'Id', 'Estatus', 'Created'],
      top: 5000,
      filter:fields.map(f => `substringof('${search}',${f})`)//["substringof('" + search + "',Criterio)"] 
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Niveles', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Nivel,
              status: r.Estatus
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
