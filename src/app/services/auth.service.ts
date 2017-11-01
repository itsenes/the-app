import { Inject, Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
import { HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { RequestOptionsArgs } from '@angular/http';

// https://github.com/damienbod/AspNet5IdentityServerAngularImplicitFlow/tree/npm-lib-test/src/AngularClient/angularApp/app
@Injectable()
export class AuthService {

  private manager: UserManager = new UserManager(getClientSettings());
  private user: User = null;
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
    if (null !== this.user) {
      return `${this.user.token_type} ${this.user.access_token}`;
    } else {
      return undefined;
    }
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect({ data: 'data' }).catch(function (err) { console.log(err); });
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
    }).catch(function (err) { console.log(err); });
  }

  startSignout(): Promise<void> {
    return this.manager.signoutRedirect().catch(function (err) { console.log(err); });
  }

  completeSignout(): Promise<void> {
    return this.manager.signoutRedirectCallback().then(user => {
      this.user = null;
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
    scope: 'openid profile email core',
    filterProtocolClaims: true,
    loadUserInfo: true
  };
}

export class SecureApiRequestOptions extends BaseRequestOptions {
  constructor( @Inject(AuthService) private authService: AuthService) {
    super();
  }
  merge(options?: RequestOptionsArgs) {
    if (options.headers) {
      options.headers.append('Authorization', this.authService.getAuthorizationHeaderValue());
    } else {
      options.headers = new Headers({ 'Authorization': this.authService.getAuthorizationHeaderValue() });
    }
    return super.merge(options);
  }
}
