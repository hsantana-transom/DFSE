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
      select: ['WWID', 'Email','Escalacion','WWIDSupervisor','EmailEscalacion','Tipo','Estatus','Nombre','RolId','Rol/Nombre','CodigoRegionId', 'CodigoRegion/Codigo', 'Id', 'Created'],
      top: 5000,
      expand:['Rol','CodigoRegion']
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Usuarios', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              wwid: r.WWID,
              email: r.Email,
              supervisor: r.Escalacion,
              emailSupervisor: r.EmailEscalacion,
              name: r.Nombre,
              rol: r.RolId,
              rolName: r.Rol.Nombre,
              regionCode: r.CodigoRegionId,
              regionName: r.CodigoRegion.Codigo,
              wwidSupervisor: r.WWIDSupervisor,
              tipo: r.Tipo,
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
    var fields=['Nombre','Email','Rol/Nombre','Tipo','Estatus',]
    const data = {
      select: ['WWID', 'Email','Escalacion','WWIDSupervisor','EmailEscalacion','Tipo','Estatus','Nombre','RolId','Rol/Nombre','CodigoRegionId', 'CodigoRegion/Codigo', 'Id', 'Created'],
      top: 5000,
      expand:['Rol','CodigoRegion'],
      filter:fields.map(f => `substringof('${search}',${f})`)//["substringof('" + search + "',Criterio)"] 
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Usuarios', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              wwid: r.WWID,
              email: r.Email,
              supervisor: r.Escalacion,
              emailSupervisor: r.EmailEscalacion,
              name: r.Nombre,
              rol: r.RolId,
              rolName: r.Rol.Nombre,
              regionCode: r.CodigoRegionId,
              regionName: r.CodigoRegion.Codigo,
              wwidSupervisor: r.WWIDSupervisor,
              tipo: r.Tipo,
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

