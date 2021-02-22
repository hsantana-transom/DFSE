
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'shared-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  acceptText = 'Aceptar';
  cancelText = 'Cancelar';
  list: string[];
  text: string;
  title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  ngOnInit() {
    if (this.data) {
      this.acceptText = this.data.acceptText ? this.data.acceptText : this.acceptText;
      this.cancelText = this.data.cancelText ? this.data.cancelText : this.cancelText;
      this.list = this.data.list;
      this.text = this.data.text;
      this.title = this.data.title;
    }
  }

  // Custom public methods

  onEvent(accepted: boolean) {
    this.dialogRef.close(accepted);
  }

}
