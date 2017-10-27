import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ApiClient } from '../../services/incontrl-apiclient';
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

  set subscriptions(value: any) {
    this.appState.subscriptions = value;
  }
  get subscriptions(): any {
    return this.appState.subscriptions;
  }

  set selected_subscription(value: any) {
    this.appState.selected_subscription = value;
    this.document_types = null;
  }
  get selected_subscription(): any {
    return this.appState.selected_subscription;
  }

  set document_types(value: any) {
    this.appState.document_types = value;
  }
  get document_types(): any {
    return this.appState.document_types;
  }

  selectSubscription(subscription: any) {
    this.selected_subscription = subscription;
    this.loadDocumentTypes(subscription)
      .subscribe((types) => {
        this.document_types = types;
        this.router.navigate([subscription.home_path]);
      });
  }

  constructor(public appState: AppStateService, private apiClient: ApiClient, private authService: AuthService, private router: Router) { }

  loadSubscriptions(): Observable<any> {
    const observable = this.apiClient.getSubscriptions().map((response) => {
      const subscriptions = response.items.map((subscription) => {
        return {
          id: subscription.id,
          alias: subscription.alias,
          code: subscription.code,
          status: subscription.status,
          contact: subscription.contact,
          company: subscription.company,
          company_logo: environment.api_url + '/subscriptions/' + subscription.id + '/image',
          notes: subscription.notes,
          home_path: '/app/' + subscription.alias,
          settings_path: '/app/' + subscription.alias + '/settings',
        };
      });
      return subscriptions;
    });
    return observable;
  }

  loadDocumentTypes(subscription): Observable<any> {
    const observable = this.apiClient.getInvoiceTypes(subscription.id)
      .map((response) => {
        const types = response.items.
          map((doc) => {
            return {
              id: doc.id, name: doc.name,
              notes: doc.notes,
              count: '?',
              search_path: subscription.home_path + '/documents/' + doc.id,
              addnew_path: subscription.home_path + '/documents/new',
            };
          });
        return types;
      });
    return observable;
  }

  ngOnInit() {
    this.authService.completeAuthentication().then(() => {
      if (this.authService.isLoggedIn) {
        this.status = 'loading your subscription information, please wait...';
        // ok get the subscriptions for the user
        this.loadSubscriptions().subscribe((subs) => {
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
