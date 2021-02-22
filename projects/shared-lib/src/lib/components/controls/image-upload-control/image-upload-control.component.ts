import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageFile } from '../../../interfaces/image-file';

@Component({
  selector: 'shared-image-upload-control',
  templateUrl: './image-upload-control.component.html',
  styleUrls: ['./image-upload-control.component.scss']
})
export class ImageUploadControlComponent {
  @Input() label: string;
  @Output() fileChange = new EventEmitter();
  @Input() file: ImageFile;
  bandImg=false;
  constructor() {

  }

  // Custom public methods

  onDelete() {
    this.file = null
    this.fileChange.emit(this.file);
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    var fileName = file.name;
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
      if(file.size>768000 )
      {
        this.bandImg=true;
      }
      else
      {
        this.bandImg=false;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.file = {
            data: reader.result,
            name: file.name,
            type: file.type,
          };

          this.fileChange.emit(this.file);
        };
      }
    }else{
        alert("Solo son permitidos los archivos con extensión jpg/jpeg y png!");
    }
   /* if(file.size>1048576 )
    {
      this.bandImg=true;
    }
    else
    {
      this.bandImg=false;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.file = {
          data: reader.result,
          name: file.name,
          type: file.type,
        };
        this.fileChange.emit(this.file);
      };
    }*/
  }

}
