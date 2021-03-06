import { Component, OnInit } from '@angular/core';
import { User } from 'oidc-client';
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
    this.router.navigate([subscription.homePath]);
  }

  constructor(public appState: AppStateService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.completeAuthentication().then(() => {
      this.authService.isLoggedIn().subscribe((result) => {
        if (result) {
          console.log('auth-callback: user is logged in!');
          this.authService.loadUser().then((user) => {
            console.log('auth-callback: going to load subscriptions!');
            this.status = `we're loading your subscription information, please wait...`;
            // ok get the subscriptions for the user
            this.appState.subscriptions.subscribe((subs) => {
              this.subscriptions = subs;
              if (subs === null || subs.length === 0) {
                console.log('user must create a subscription');
                this.router.navigate(['/new-subscription']);
              } else if (subs.length === 1) {
                this.status = `welcome ${user.profile.name}, we're loading your configuration information, please wait...`;
                this.selectSubscription(subs[0]);
              } else {
                this.status = `welcome ${user.profile.name}, please select a subscription to proceed...`;
                this.displaySubscriptionsList = true;
              }
            }, (error) => {
              console.log('error loading subscriptions' + error);
              this.appState.onError(error);
            });
          });
        } else {
          console.log('redirect to unauthorized!');
          this.router.navigate(['/unauthorized']);
        }
      });
    });
  }

}
