import { Component, OnInit } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  columns = 3;
  userJson = null;
  user = null;
  constructor(private media: ObservableMedia, public authService: AuthService) {
    this.user = authService.currentUser().profile;
    this.userJson = JSON.stringify(this.user);
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
