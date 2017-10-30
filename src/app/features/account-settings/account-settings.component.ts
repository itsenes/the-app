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
  constructor(private appState: AppStateService, private authService: AuthService) { }

  signout() {
    this.authService.startSignout();
  }

  ngOnInit() {
    this.user = this.authService.currentUser().profile;
    this.appState.subscriptions.subscribe((subs) => {
      this.subscriptions = subs;
      this.hasMultipleSubs = (subs != null) && (subs.length > 1);
      this.multipleSubsRowspan = this.hasMultipleSubs ? 2 : 1;
    });
  }

}
