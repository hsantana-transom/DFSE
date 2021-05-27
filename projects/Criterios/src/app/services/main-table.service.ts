import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainDataSource } from '../datasources/main-data-source';


/**
 * Main service
 */
@Injectable({
  providedIn: 'root'
})
export class MainTableService {

  dataSource: MainDataSource;
  constructor(private sis: SharepointIntegrationService) {
    this.dataSource = new MainDataSource();
  }
    /**
   * Clears data in dataSource array
   */
  clearAll() {
    this.dataSource.clearAll();
  }
    /**
   * Gets data from Criterios Sharepoint List
   */
  loadData() {
    const data = {
      select: ['Criterio', 'Id', 'Estatus', 'Created'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Criterios', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Criterio,
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
    /**
   * Gets search Data from Criterios Sharepoint list
   * @param search search string to filter query
   */
  loadSearch(search) {
    var fields=['Id','CriterioCorto','Estatus']
    const data = {
      select: ['Criterio', 'Id', 'Estatus','CriterioCorto', 'Created'],
      top: 5000,
      filter:fields.map(f => `substringof('${search}',${f})`)//["substringof('" + search + "',Criterio)"] 
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Criterios', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Criterio,
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
