import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ApiClient } from '../../services/incontrl-apiclient';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {
  status = 'loading your profile, please wait...';
  constructor(private appState: AppStateService, private apiClient: ApiClient, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.completeAuthentication().then(() => {
      if (this.authService.isLoggedIn) {
        this.status = 'loading your subscription information, please wait...';
        this.apiClient.getSubscriptions()
          .subscribe((subscriptions) => {
            if (subscriptions.count > 0) {
              this.appState.subscriptions = subscriptions.items;
              this.appState.selected_subscription = subscriptions.items[0];
              this.status = 'loading your document types information, please wait...';
              this.apiClient.getInvoiceTypes(this.appState.selected_subscription.id)
                .subscribe((invoiceTypes) => {
                  // add logic if user does not have any document types then she should get one!
                  this.appState.document_types = invoiceTypes.items;
                  this.router.navigate(['/app/' + this.appState.selected_subscription.alias]);
                });
            } else {
              // user must create a subscription
            }
          }, (error) => {
            console.log(error);
            // and redirect to error i guess!
          });
      } else {
        console.log('should redirect to unauthorized!');
        this.router.navigate(['/unauthorized']);
      }
    });
  }

}
