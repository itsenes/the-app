import { Component, OnInit } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  columns = 3;

  constructor(media: ObservableMedia) {
    media.asObservable()
      .subscribe((change: MediaChange) => {
        console.log(change.mqAlias);
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else {
          this.columns = 3;
        }
      });
  }

  ngOnInit() {
  }

}
