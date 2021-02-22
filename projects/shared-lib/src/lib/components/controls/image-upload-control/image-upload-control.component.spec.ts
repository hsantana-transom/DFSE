import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadControlComponent } from './image-upload-control.component';

describe('ImageUploadControlComponent', () => {
  let component: ImageUploadControlComponent;
  let fixture: ComponentFixture<ImageUploadControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageUploadControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageUploadControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
