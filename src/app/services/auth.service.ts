import { Inject, Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
import { HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { RequestOptionsArgs } from '@angular/http';
import { environment } from '../../environments/environment';

// https://github.com/damienbod/AspNet5IdentityServerAngularImplicitFlow/tree/npm-lib-test/src/AngularClient/angularApp/app
@Injectable()
export class AuthService {

  private manager: UserManager;
  private user: User = null;
  constructor() {
    this.manager = new UserManager(environment.auth_settings);
    // this.manager.getUser().then(user => {
    //   this.user = user;
    // });
  }

  loadUser(): Promise<User> {
    console.log('getUser: getting user info');
    return this.manager.getUser().then((user) => {
      this.user = user;
      return user;
    });
  }

  currentUser(): User {
    console.log('currentUser: return current user');
    return this.user;
  }

  isLoggedIn(): boolean {
    console.log('isLoggedIn: check user');
    return this.user !== null && !this.user.expired;
  }

  getClaims(): any {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    if (null !== this.user) {
      return `${this.user.token_type} ${this.user.access_token}`;
    } else {
      console.log('getAuthorizationHeaderValue returned null');
      return undefined;
    }
  }

  startAuthentication(url): Promise<void> {
    // return this.manager.signinRedirect({ data: url }).catch(function (err) { console.log(err); });
    console.log('startAuthentication!');
    return this.manager.signinRedirect().catch(function (err) { console.log(err); });
  }

  completeAuthentication(): Promise<void> {
    console.log('completeAuthentication started!');
    return this.manager.signinRedirectCallback().then(user => {
      console.log('completeAuthentication completed :)');
      this.user = user;
    }).catch(function (err) {
      console.log(err);
    });
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
  return environment.auth_settings;
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
