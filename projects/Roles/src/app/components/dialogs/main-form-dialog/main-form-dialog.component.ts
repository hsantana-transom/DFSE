import { Component, OnInit, ViewChild, Inject  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'shared-lib';
import { MainFormComponent } from '../../forms/main-form/main-form.component';
import { MainTableService } from '../../../services/main-table.service';

/**
 * Main Dialog Component
 */
@Component({
  selector: 'app-main-form-dialog',
  templateUrl: './main-form-dialog.component.html',
  styleUrls: ['./main-form-dialog.component.scss']
})
export class MainFormDialogComponent implements OnInit {

  loading = false;
  @ViewChild(MainFormComponent, { static: false }) mfc: MainFormComponent;
  title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MainFormComponent>,
    private message: MessageService,
    private mts: MainTableService,

  ) {

   }

  ngOnInit() {
    this.title = this.data ? 'Editar' : 'Agregar';

  }
  
  /**
   * Closes dialog
   */
  onClose() {
    this.dialogRef.close();
  }
  
  /**
   * loads data to main table when new item is submitted
   */
  onSubmit() {
    this.loading = true;

    this.mfc.disableFields();

    this.mfc.submit()
      .subscribe(
        response => {
          if (response) {
            this.dialogRef.close(true);
            this.mts.loadData().subscribe();
          }
          else
          {
            this.dialogRef.close(true);
            this.mts.loadData().subscribe();
          }
        },
        err => this.message.genericHttpError(err)
      );

  }

}
