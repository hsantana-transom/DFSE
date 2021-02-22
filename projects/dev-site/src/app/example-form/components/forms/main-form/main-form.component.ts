import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';

@Component({
  selector: 'ds-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {
  @Input() data: any;
  fields: any = {};
  flags = {
    loadingFields: true
  };
  private isNew: boolean;
  keywords: string[] = [];
  mainForm: FormGroup;
  mainImage = null;
  secondaryImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];

  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService
  ) { }

  ngOnInit() {
    this.isNew = this.data ? false : true;

    this.setupForm();
  }

  // Custom public methods

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  onFileEvent(event: ImageFile, type: string) {
    switch (type) {
      case 'main':
        this.mainImage = event;
        break;
      case 'secondary':
        this.secondaryImage = event;
        break;
    }
  }

  removeKeyword(keyword: any) {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
  }

  submit() {
    const values = this.mainForm.value;

    values.keywords = this.keywords;
    values.mainImage = this.mainImage;
    values.secondaryImage = this.secondaryImage;

    const data: any = {
      __metadata: { type: 'SP.Data.NoticiasListItem' },
      Descripcion: values.summary,
      Fechanoticia: values.newsDate.toISOString(),
      Imagen: this.mainImage.data,
      Imagen2: this.secondaryImage.data,
      Noticia: values.content,
      Orden: values.order,
      PalabrasClave: this.keywords.join(','),
      Title: values.title
    };

    if (values.id) {
      data.Id = values.id;
    }

    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Noticias', data, formDigest);
      })
    );
  }

  // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      content: [null, Validators.required],
      newsDate: [null, Validators.required],
      id: null,
      order: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      summary: [null, Validators.required],
      title: [null, Validators.required]
    });

    if (!this.isNew) {
      const data = {
        select: ['Imagen', 'Imagen2', 'Noticia', 'PalabrasClave']
      };

      this.mainForm.patchValue({
        id: this.data.id,
        newsDate: this.data.newsDate,
        order: this.data.order,
        summary: this.data.summary,
        title: this.data.title
      });

      // Load the rest of the fields

      this.sis.read('Noticias', data, this.data.id)
        .subscribe((response: any) => {
          this.mainForm.patchValue({
            content: response.Noticia
          });

          this.keywords = response.PalabrasClave.split(',');
          this.mainImage = {
            data: response.Imagen,
            name: 'Image',
            type: 'image/png'
          };
          this.secondaryImage = {
            data: response.Imagen2,
            name: 'Image',
            type: 'image/png'
          };
        });
    }
  }

  // Getters and setters

  get order() {
    return this.mainForm.get('order');
  }

}
