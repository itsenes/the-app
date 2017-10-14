import { Component, OnInit } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  gridColumns = 5;

  constructor(media: ObservableMedia) {
    media.asObservable()
      .subscribe((change: MediaChange) => {
        console.log(change.mqAlias);
        if (change.mqAlias === 'xs') {
          this.gridColumns = 1;
        } else if (change.mqAlias === 'sm') {
          this.gridColumns = 2;
        } else if (change.mqAlias === 'md') {
          this.gridColumns = 3;
        } else {
          this.gridColumns = 5;
        }
      });
  }

  ngOnInit() {
  }

}
