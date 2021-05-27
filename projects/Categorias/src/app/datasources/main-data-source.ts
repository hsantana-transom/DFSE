import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

 /**
  * Data Source class
*/
export class MainDataSource extends DataSource<any>  {
    data: any[] = [];
    dataStream = new BehaviorSubject(null);
    paginator: MatPaginator;
    sort: MatSort;
  
    constructor() {
      super();
    }

    /**
     * Creates a Stream of data
     */
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
    
    /**
     * disconect data stream
     */
    disconnect() {}
  
    // Custom public methods
    
    /**
     * clears data array
     */
    clearAll() {
      this.data = [];
      this.trigger();
    }
  
    /**
     * replace data array with the new data
     * @param newData new data recieved
     */
    replaceAll(newData: any[]) {
      this.data = newData;
      this.trigger();
    }
  
    // Custom private methods
  
    /**
     * Gets data per page
     * @param data Categorias data
     */
    private getPagedData(data: any[]) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    }

    /**
     * Sorts data in the table
     * @param data Categorias data
     */
    private getSortedData(data: any[]) {
      if (!this.sort.active || this.sort.direction === '') {
        return data;
      }
  
      return data.sort((a, b) => {
        const isAsc = this.sort.direction === 'asc';
  
        switch (this.sort.active) {
          case 'id': return compare(a.id, b.id, isAsc);
          case 'name': return compare(a.name, b.name, isAsc);
          case 'status': return compare(a.status, b.status, isAsc);
          default: return 0;
        }
      });
    }

    /**
     * Clears data stream
     */
    private trigger() {
      this.dataStream.next(null);
    }
  }

  /**
   * Compares data to sort
   * @param a data 1 to compare with param b
   * @param b data 2 to compare with param a
   * @param isAsc  boolean to sort ascendent or descendent
   */
  function compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
