import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionListComponent } from '../subscription-list/subscription-list.component';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html'
})
export class AuthCallbackComponent implements OnInit {
  status = 'loading your profile, please wait...';
  displaySubscriptionsList = false;
  subscriptions = null;

  selectSubscription(subscription: any) {
    this.appState.selectSubscription(subscription);
    this.router.navigate([subscription.home_path]);
  }

  constructor(public appState: AppStateService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.completeAuthentication().then(() => {
      if (this.authService.isLoggedIn) {
        this.status = 'loading your subscription information, please wait...';
        // ok get the subscriptions for the user
        this.appState.subscriptions.subscribe((subs) => {
          this.subscriptions = subs;
          if (subs === null || subs.length === 0) {
            console.log('user must create a subscription');
            this.router.navigate(['/new-subscription']);
          } else if (subs.length === 1) {
            this.status = 'loading your configuration information, please wait...';
            this.selectSubscription(subs[0]);
          } else {
            this.status = 'Please select a subscription to proceed...';
            this.displaySubscriptionsList = true;
          }
        }, (error) => {
          console.log('error loading subscriptions' + error);
          this.router.navigate(['/error', { data: error }]);
        });
      } else {
        console.log('should redirect to unauthorized!');
        this.router.navigate(['/unauthorized']);
      }
    });
  }

}
