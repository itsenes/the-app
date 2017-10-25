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
  constructor(private appState: AppStateService, private authService: AuthService) {
    this.user = authService.currentUser().profile;
    this.subscriptions = appState.subscriptions;
  }

  ngOnInit() {
  }

}
