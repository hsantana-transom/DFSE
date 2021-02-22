import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'shared-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent implements OnInit {
  @Input() cancelText = 'Cancelar';
  @Output() closeEvent = new EventEmitter();
  @Input() disabled: boolean;
  @Input() loading: boolean;
  @Input() showSubmit = true;
  @Output() submitEvent = new EventEmitter();
  @Input() submitText = 'Guardar';
  @Input() title: string;

  constructor() { }

  ngOnInit() {
  }

  // Custom public methods

  onClose() {
    this.closeEvent.emit();
  }

  onSubmit() {
    this.submitEvent.emit();
  }

}
