import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor() { }

  disableFields(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      form.get(key).disable();
    });
  }

  enableFields(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      form.get(key).enable();
    });
  }
}
