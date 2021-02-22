import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export class MainDataSource extends DataSource<any>  {
    data: any[] = [];
    dataStream = new BehaviorSubject(null);
    paginator: MatPaginator;
    sort: MatSort;
  
    constructor() {
      super();
    }
    connect(): Observable<any[]> {
      const dataMutations = [
        this.dataStream,
        this.paginator.page,
        this.sort.sortChange
      ];
  
      return merge(...dataMutations).pipe(map(() => {
        return this.getPagedData(this.getSortedData([...this.data]));
      }));
    }
  
    disconnect() {}
  
    // Custom public methods
  
    clearAll() {
      this.data = [];
      this.trigger();
    }
  
    replaceAll(newData: any[]) {
      this.data = newData;
      this.trigger();
    }
  
    // Custom private methods
  
    private getPagedData(data: any[]) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    }
  
    private getSortedData(data: any[]) {
      if (!this.sort.active || this.sort.direction === '') {
        return data;
      }
  
      return data.sort((a, b) => {
        const isAsc = this.sort.direction === 'asc';
  
        switch (this.sort.active) {
          case 'id': return compare(a.id, b.id, isAsc);
          case 'fechaLabel': return compare(a.fechaLabel, b.fechaLabel, isAsc);
          case 'categoryName': return compare(a.categoryName, b.categoryName, isAsc);
          case 'levelName': return compare(a.levelName, b.levelName, isAsc);
          case 'topicName': return compare(a.topicName, b.topicName, isAsc);
          case 'criterioShort': return compare(a.criterioShort, b.criterioShort, isAsc);
          default: return 0;
        }
      });
    }
  
    private trigger() {
      this.dataStream.next(null);
    }
  }
  
  function compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  