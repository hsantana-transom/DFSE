
import { Injectable, Inject } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../components/dialogs/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private duration = this.env.snackbarDuration ? this.env.snackbarDuration : 3000;

  constructor(
    private dialog: MatDialog,
    @Inject('env') private env: any,
    private snackbar: MatSnackBar
  ) { }

  confirm(data: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  genericHttpError(error?: any) {
    if (error) {
      console.log(error);
    }

    this.snackbar.open('Error de conexión', null, { duration: this.duration });
  }

  genericSaveMessage() {
    this.snackbar.open('Información guardada', null, { duration: this.duration });
  }

  show(message: string) {
    this.snackbar.open(message, null, { duration: this.duration });
  }
}
