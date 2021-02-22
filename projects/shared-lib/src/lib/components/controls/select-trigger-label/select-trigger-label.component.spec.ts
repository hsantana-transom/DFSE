import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTriggerLabelComponent } from './select-trigger-label.component';

describe('SelectTriggerLabelComponent', () => {
  let component: SelectTriggerLabelComponent;
  let fixture: ComponentFixture<SelectTriggerLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTriggerLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTriggerLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
