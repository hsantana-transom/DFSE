import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MessageService } from 'shared-lib';
import { MainFormDialogComponent } from '../../dialogs/main-form-dialog/main-form-dialog.component';

@Component({
  selector: 'ds-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private message: MessageService
  ) { }

  ngOnInit() {
  }

  // Custom public methods

  onAdd() {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.message.genericSaveMessage();
        }
      });
  }

}
