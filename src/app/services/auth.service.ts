import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';

// https://github.com/damienbod/AspNet5IdentityServerAngularImplicitFlow/tree/npm-lib-test/src/AngularClient/angularApp/app
@Injectable()
export class AuthService {

  private manager: UserManager = new UserManager(getClientSettings());
  private user: User = null;
  public redirectUrl: String = '';
  constructor() {
    this.manager.getUser().then(user => {
      this.user = user;
    });
  }

  currentUser(): User {
    return this.user;
  }

  isLoggedIn(): boolean {
    return this.user != null && !this.user.expired;
  }

  getClaims(): any {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect({ target_url: this.redirectUrl }).catch(function (err) { console.log(err); });
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
    }).catch(function (err) { console.log(err); });
  }
}

export function getClientSettings(): UserManagerSettings {
  // return {
  //   authority: 'http://localhost:20200/',
  //   client_id: 'spa',
  //   redirect_uri: 'http://localhost:4200/auth-callback',
  //   post_logout_redirect_uri: 'http://localhost:4200/logged-out',
  //   response_type: 'id_token token',
  //   scope: 'openid profile core',
  //   filterProtocolClaims: true,
  //   loadUserInfo: true
  // };

  return {
    authority: 'https://incontrl.io/',
    client_id: 'spa',
    redirect_uri: 'http://localhost:4200/auth-callback',
    post_logout_redirect_uri: 'http://localhost:4200/logged-out',
    response_type: 'id_token token',
    scope: 'openid profile core',
    filterProtocolClaims: true,
    loadUserInfo: true
  };
}
