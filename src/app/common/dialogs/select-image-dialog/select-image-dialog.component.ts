import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-select-image-dialog',
  templateUrl: './select-image-dialog.component.html',
  styleUrls: ['./select-image-dialog.component.css']
})
export class SelectImageDialogComponent {
  imagePath: any = '';
  constructor(public dialogRef: MatDialogRef<SelectImageDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.imagePath = data.imagePath;
  }

  ok() {
    this.dialogRef.close(this.imagePath);
  }

  cancel() {
    this.dialogRef.close();
  }
}
