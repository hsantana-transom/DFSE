import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedLibModule } from 'shared-lib';

import { ExampleFormRoutingModule } from './example-form-routing.module';

// Custom components

import { MainFormDialogComponent } from './components/dialogs/main-form-dialog/main-form-dialog.component';
import { MainFormComponent } from './components/forms/main-form/main-form.component';
import { MainTableComponent } from './components/tables/main-table/main-table.component';
import { MainViewComponent } from './components/views/main-view/main-view.component';

// Material components

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    MainFormComponent,
    MainFormDialogComponent,
    MainViewComponent,
    MainTableComponent
  ],
  entryComponents: [
    MainFormDialogComponent
  ],
  imports: [
    CommonModule,
    ExampleFormRoutingModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    SharedLibModule
  ]
})
export class ExampleFormModule { }
