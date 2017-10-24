import { Component, OnInit } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';

const default_columns = 3;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  columns = default_columns;
  userJson = null;
  user = null;
  document_tiles = [];
  settings_path = null;
  constructor(private media: ObservableMedia, private authService: AuthService, private appState: AppStateService) {
    this.user = authService.currentUser().profile;
    this.userJson = JSON.stringify(this.user);
    this.settings_path = appState.selected_subscription.settings_path;
    this.document_tiles = appState.document_types;

    media.asObservable()
      .subscribe((change: MediaChange) => {
        console.log('media change (mqAlias): ' + change.mqAlias);
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else {
          this.columns = default_columns;
        }
      });
  }

  ngOnInit() {
  }

}
