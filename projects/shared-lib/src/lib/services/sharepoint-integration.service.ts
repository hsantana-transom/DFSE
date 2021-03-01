import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ReadData } from '../interfaces/read-data';

@Injectable({
  providedIn: 'root'
})
export class SharepointIntegrationService {
  private listApiPath = '/sites/CC140991/_api/web/lists';
  sitioLocal = '';
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
    const url = `${this.sitioLocal}${subsite}${this.listApiPath}/getbytitle('${listName}')/items(${id})`;
   // const url = `${this.listApiPath}/getbytitle('${listName}')/items(${id})`;

    return this.http.delete(url, config);
  }

  getFormDigest() {
    const options = {
      headers: new HttpHeaders({
        accept: 'application/json;odata=verbose'
      })
    };

    return this.http.post('/sites/CC140991/_api/contextinfo', options)
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

    return this.http.post(this.sitioLocal + subsite + '/_api/contextinfo', options)
      .pipe(
        map((response: any) => response.FormDigestValue)
      );
  }
 
  read(listName: string, data?: ReadData, id?: number) {
    const url = this.getQuery(listName, data, id);
    return this.http.get(url);
  }
  readUserFromGroup(GroupId:string,wwid:string) {
    const url = "/sites/CC140991/_api/web/sitegroups/GetById('"+ GroupId + "')/users?$select=Email,Id,LoginName&$filter=(substringof('" + wwid.toLowerCase() + "',LoginName))"
    return this.http.get(url);
  }
  readFromsubSite(subSite: string, listName: string, data?: ReadData, id?: number) {
    const url = this.getQueryFromsubSite(subSite, listName, data, id);

    return this.http.get(url);
  }
  readCurrentUser()
  {
    const url="/sites/CC140991/_api/web/currentuser"
    return this.http.get(url);
  }
  deleteUserFromGroup(GroupId: string,email:string, formDigest: string)
  {
    const config = this.createConfig(formDigest, 'delete');
    const url =  "/sites/CC140991/_api/web/sitegroups/GetById(" + GroupId + ")/users/getbyemail('"+ email +"')";
    return this.http.delete(url,config);
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
    const url = `${this.sitioLocal}${subSite}${this.listApiPath}/getbytitle('${listName}')/items` + (isNew ? '' : `(${data.Id})`);
    const config = this.createConfig(formDigest, isNew ? null : 'edit');

    return this.http.post(url, data, config);

    /*if (isNew) {
      return this.http.post(url, data, config);
    }

    return this.http.put(url, data, config);*/
  }
  saveFile(formDigest: string)
  {
    const url="/sites/CC140991/_api/web/GetFolderByServerRelativeUrl('Documents/My%20new%20folder')/Files/add(url='C:/Users/qy411/Documents/test.txt',overwrite=true)"
    const config = this.createConfig(formDigest, 'edit');
    console.log(config);
    return this.http.post(url, config);
  }
  saveUserInGroup(group: string, data: any, formDigest: string)
  {
    //const url = `${this.listApiPath}/getbytitle('${listName}')/items` + (isNew ? '' : `(${data.Id})`);
    const isNew = !data.Id;
    const url=`/sites/CC140991/_api/web/SiteGroups/GetById('${group}')/users`;
    const config = this.createConfig(formDigest, isNew ? null : 'edit');
    console.log(config);
    return this.http.post(url, data, config);
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
    let url = `${this.sitioLocal}${subSite}${this.listApiPath}/getbytitle('${listName}')/items` + (id ? `(${id})` : '');

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
  createFileConfig(formDigest: string, size: string) {
    let headers = new HttpHeaders({
      accept: 'application/application/atom+xml',
      "X-RequestDigest": formDigest,
     
    });

    return {
      headers
    };
  }
  saveFile2(data,formDigest: string,size:string)
  {
    const url="/sites/CC140991/_api/web/lists/getByTitle('Documents')/rootfolder/files/add(url='C:/Users/qy411/Documents/test.txt',overwrite=true)"
    const config = this.createFileConfig(formDigest, size);
    console.log(config);
    return this.http.post(url, config);
  }

}
