import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedLibModule } from 'shared-lib';
import 'hammerjs';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// Custom components
import { MainTableComponent } from './components/tables/main-table/main-table.component';
import { MainFormComponent } from './components/forms/main-form/main-form.component';
import { MainFormDialogComponent } from './components/dialogs/main-form-dialog/main-form-dialog.component';


// Material components

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import { MatPaginatorIntl } from '@angular/material/paginator';


@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    MainTableComponent,
    MainFormComponent,
    MainFormDialogComponent
  ],
  entryComponents: [
    MainFormDialogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    SharedLibModule.forRoot(environment)
  ],
  providers: [],

})
export class AppModule { }
