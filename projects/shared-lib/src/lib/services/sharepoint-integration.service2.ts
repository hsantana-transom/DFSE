import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ReadData } from '../interfaces/read-data';

@Injectable({
  providedIn: 'root'
})
export class SharepointIntegrationService {
  private listApiPath = '/sitios/SitioPrincipal/_api/web/lists';
  private listApiPath2 = '/_api/web/lists';
  sitioLocal: string = 'http://win-8si9e49b5j3/';
  constructor(
    private http: HttpClient
  ) { }

  createConfig(formDigest: string, type?: string) {
    let headers = new HttpHeaders({
      accept: 'application/json;odata=verbose',
      'content-type': 'application/json;odata=verbose',
      'X-RequestDigest': formDigest
    });

    switch (type) {
      case 'delete':
        headers = headers.set('If-Match', '*');
        headers = headers.set('X-HTTP-Method', 'DELETE');
        break;
      case 'edit':
        headers = headers.set('If-Match', '*');
        headers = headers.set('X-HTTP-Method', 'MERGE');
        break;
    }

    return {
      headers
    };
  }

  delete(listName: string, id: number, formDigest: string) {
    const config = this.createConfig(formDigest, 'delete');
    const url = `${this.listApiPath}/getbytitle('${listName}')/items(${id})`;

    return this.http.delete(url, config);
  }
  deletesubSite(subsite:string, listName: string, id: number, formDigest: string) {
    const config = this.createConfig(formDigest, 'delete');
    const url = `${this.sitioLocal}${subsite}${this.listApiPath2}/getbytitle('${listName}')/items(${id})`;
   // const url = `${this.listApiPath}/getbytitle('${listName}')/items(${id})`;

    return this.http.delete(url, config);
  }

  getFormDigest() {
    const options = {
      headers: new HttpHeaders({
        accept: 'application/json;odata=verbose'
      })
    };

    return this.http.post('/sitios/SitioPrincipal/_api/contextinfo', options)
      .pipe(
        map((response: any) => response.FormDigestValue)
      );
  }
  getFormDigestsubSite(subsite: string) {
    const options = {
      headers: new HttpHeaders({
        accept: 'application/json;odata=verbose'
      })
    };

    return this.http.post( this.sitioLocal + subsite + '/_api/contextinfo', options)
      .pipe(
        map((response: any) => response.FormDigestValue)
      );
  }
  read(listName: string, data?: ReadData, id?: number) {
    const url = this.getQuery(listName, data, id);

    return this.http.get(url);
  }
  readFromsubSite(subSite: string, listName: string, data?: ReadData, id?: number) {
    const url = this.getQueryFromsubSite(subSite, listName, data, id);

    return this.http.get(url);
  }
  save(listName: string, data: any, formDigest: string) {
    const isNew = !data.Id;
    const url = `${this.listApiPath}/getbytitle('${listName}')/items` + (isNew ? '' : `(${data.Id})`);
    const config = this.createConfig(formDigest, isNew ? null : 'edit');

    return this.http.post(url, data, config);

    /*if (isNew) {
      return this.http.post(url, data, config);
    }

    return this.http.put(url, data, config);*/
  }
  saveInSite(subSite:string, listName: string, data: any, formDigest: string) {
    const isNew = !data.Id;
    const url = `${this.sitioLocal}${subSite}${this.listApiPath2}/getbytitle('${listName}')/items` + (isNew ? '' : `(${data.Id})`);
    const config = this.createConfig(formDigest, isNew ? null : 'edit');

    return this.http.post(url, data, config);

    /*if (isNew) {
      return this.http.post(url, data, config);
    }

    return this.http.put(url, data, config);*/
  }
  // Private methods

  private getQuery(listName: string, data?: ReadData, id?: number) {
    const config: string[] = [];
    let url = `${this.listApiPath}/getbytitle('${listName}')/items` + (id ? `(${id})` : '');

    if (data) {
      url += '?';

      if (data.top) {
        config.push(`$top=${data.top}`);
      }

      if (data.select) {
        config.push('$select=' + data.select.join(','));
      }

      if (data.filter) {
        config.push('$filter=' + data.filter.map(s => `(${s})`).join(' and '));
      }

      if (data.expand) {
        config.push('$expand=' + data.expand.join(','));
      }

      if (data.orderBy) {
        config.push(`$orderby=${data.orderBy}` + (data.reverse ? ' desc' : ''));
      }
    }

    return url + config.join('&');
  }
  private getQueryFromsubSite(subSite: string, listName: string, data?: ReadData, id?: number) {
    const config: string[] = [];
    let url = `${this.sitioLocal}${subSite}${this.listApiPath2}/getbytitle('${listName}')/items` + (id ? `(${id})` : '');

    if (data) {
      url += '?';

      if (data.top) {
        config.push(`$top=${data.top}`);
      }

      if (data.select) {
        config.push('$select=' + data.select.join(','));
      }

      if (data.filter) {
        config.push('$filter=' + data.filter.map(s => `(${s})`).join(' and '));
      }

      if (data.expand) {
        config.push('$expand=' + data.expand.join(','));
      }

      if (data.orderBy) {
        config.push(`$orderby=${data.orderBy}` + (data.reverse ? ' desc' : ''));
      }
    }

    return url + config.join('&');
  }
}
