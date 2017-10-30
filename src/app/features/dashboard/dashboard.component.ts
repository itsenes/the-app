import { Component, OnInit, OnDestroy } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';

const default_columns = 4;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  columns = default_columns;
  userJson = null;
  user = null;
  subscription = null;
  document_types = null;
  mediaSub: any = null;
  constructor(private media: ObservableMedia, private authService: AuthService, private appState: AppStateService) {
    this.user = authService.currentUser().profile;
    this.userJson = JSON.stringify(this.user);
    this.subscription = this.appState.current_subscription;
    // this.settings_path = null;
    // appState. .sub .settings_path;
    // this.document_tiles = appState.document_types;
    // this.subscription = appState.selected_subscription;
    // this.company = appState.selected_subscription.company;
    this.mediaSub = media.asObservable()
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

  ngOnDestroy() {
    this.mediaSub.unsubscribe();
  }

}
