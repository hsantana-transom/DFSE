import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MessageService,SharepointIntegrationService } from 'shared-lib';
import { MainFormDialogComponent } from './components/dialogs/main-form-dialog/main-form-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private dialog: MatDialog,
    private message: MessageService,
    private sis: SharepointIntegrationService
  ) { }

  // Custom public methods
  /**
   * calls the component that creates the form dialog
   */
  onAdd() {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      disableClose: true,
      width: "60%"
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.message.genericSaveMessage();
        }
      });
  }
}

