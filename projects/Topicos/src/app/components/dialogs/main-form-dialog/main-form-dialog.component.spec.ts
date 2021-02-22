import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainFormDialogComponent } from './main-form-dialog.component';

describe('MainFormDialogComponent', () => {
  let component: MainFormDialogComponent;
  let fixture: ComponentFixture<MainFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
