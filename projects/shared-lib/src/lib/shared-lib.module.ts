import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';


// Custom components

import { AddButtonComponent } from './components/controls/add-button/add-button.component';
import { ImageUploadControlComponent } from './components/controls/image-upload-control/image-upload-control.component';
import { ProgressBarComponent } from './components/controls/progress-bar/progress-bar.component';
import { ProgressSpinnerComponent } from './components/controls/progress-spinner/progress-spinner.component';
import { SelectTriggerLabelComponent } from './components/controls/select-trigger-label/select-trigger-label.component';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { FormDialogComponent } from './components/dialogs/form-dialog/form-dialog.component';
import { DataTableComponent } from './components/tables/data-table/data-table.component';

// Material components

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl,  } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AddButtonComponent,
    ConfirmDialogComponent,
    DataTableComponent,
    FormDialogComponent,
    ImageUploadControlComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    SelectTriggerLabelComponent
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  exports: [
    AddButtonComponent,
    DataTableComponent,
    FormDialogComponent,
    ImageUploadControlComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    SelectTriggerLabelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
  ],

})
export class SharedLibModule {
  static forRoot(environment: any): ModuleWithProviders {
    return {
      ngModule: SharedLibModule,
      providers: [
        {
          provide: 'env',
          useValue: environment
        }
      ]
    };
  }
}
