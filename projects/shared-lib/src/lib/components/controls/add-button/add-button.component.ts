import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'shared-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.scss']
})
export class AddButtonComponent implements OnInit {
  @Input() matIcon = 'add';
  @Input() text = 'Agregar';
  @Output() callback = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  // Custom public methods

  onClick() {
    this.callback.emit();
  }

}
