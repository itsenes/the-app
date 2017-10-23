import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {
  user = null;
  constructor(private authService: AuthService) {
    this.user = authService.currentUser().profile;
  }

  ngOnInit() {
  }

}
