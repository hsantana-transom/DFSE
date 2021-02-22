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
      select: ['Fecha','CategoriaId','Categoria/Categoria','TopicoId','Topico/Topico', 'Id','NivelId','Nivel/Nivel','CriterioId','CriterioCorto','Entrenador', 'Created'],
      top: 5000,
      expand:['Categoria','Topico','Nivel']
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Fechas', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              fecha: new Date(r.Fecha),
              category: r.CategoriaId,
              categoryName:r.Categoria.Categoria,
              level: r.NivelId,
              levelName: r.Nivel.Nivel,
              topic: r.TopicoId,
              topicName: r.Topico.Topico,
              criteria: r.CriterioId,
              criterioShort: r.CriterioCorto,
              trainer: r.Entrenador
            };
            item.criteriaName= this.getCriterioText(item.id);
            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.fechaLabel= datePipe.transform(item.fecha, 'dd-MM-yyyy');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
  getCriterioText(id)
  {
    const data={
      select:['Id,Criterio'],
      top:1,
      filter: ['Id eq ' + id]
    };
     this.sis.read("Criterios",data).subscribe((response:any)=>{
      return response.value[0].Criterio
    })
  }
  loadSearch(search) {
    var fields=['fechaString','Categoria/Categoria','Topico/Topico', 'Id','Nivel/Nivel','CriterioCorto']
    const data = {
      select: ['Fecha','fechaString','CategoriaId','Categoria/Categoria','TopicoId','Topico/Topico', 'Id','NivelId','Nivel/Nivel','CriterioId','CriterioCorto', 'Entranador', 'Created'],
      top: 5000,
      expand:['Categoria','Topico','Nivel'],
      filter:fields.map(f => `substringof('${search}',${f})`)//["substringof('" + search + "',Criterio)"] 
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Fechas', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              fecha: new Date(r.Fecha),
              category: r.CategoriaId,
              categoryName:r.Categoria.Categoria,
              level: r.NivelId,
              levelName: r.Nivel.Nivel,
              topic: r.TopicoId,
              topicName: r.Topico.Topico,
              criteria: r.CriterioId,
              criterioShort: r.CriterioCorto,
              trainer: r.Entrenador
              //criteriaName: r.Criterio.Criterio
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            item.fechaLabel= datePipe.transform(item.fecha, 'dd-MM-yyyy');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
}
