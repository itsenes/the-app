import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  user = null;
  subscriptions = null;
  hasMultipleSubs = false;
  multipleSubsRowspan = 1;
  currentSubId = null;
  constructor(private appState: AppStateService, private authService: AuthService) {
    this.user = authService.currentUser().profile;
    this.currentSubId = this.appState.selected_subscription.id;
    this.hasMultipleSubs = (appState.subscriptions != null) && (appState.subscriptions.length > 1);
    this.multipleSubsRowspan = this.hasMultipleSubs ? 2 : 1;
    this.subscriptions = appState.subscriptions;
  }

  signout() {
    this.authService.startSignout();
  }

  ngOnInit() {
  }

}
