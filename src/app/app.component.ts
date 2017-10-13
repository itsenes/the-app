import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  template: '<app-shell></app-shell>'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'THE-APP';

  constructor(public oidcSecurityService: OidcSecurityService) {
    if (this.oidcSecurityService.moduleSetup) {
      this.doCallbackLogicIfRequired();
    } else {
      this.oidcSecurityService.onModuleSetup.subscribe(() => {
        this.doCallbackLogicIfRequired();
      });
    }
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

  private doCallbackLogicIfRequired() {
    if (window.location.hash) {
      this.oidcSecurityService.authorizedCallback();
    }
  }

}
