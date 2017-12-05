import { Inject, Injectable, EventEmitter } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
import { HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { RequestOptionsArgs } from '@angular/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Rx';


// https://www.scottbrady91.com/Angular/SPA-Authentiction-using-OpenID-Connect-Angular-CLI-and-oidc-client
@Injectable()
export class AuthService {

  private manager: UserManager = new UserManager(environment.auth_settings);
  userLoadededEvent: EventEmitter<User> = new EventEmitter<User>();
  private user: User = null;

  constructor() {
    this.manager = new UserManager(environment.auth_settings);
    this.manager.getUser().then(user => {
      this.user = user;
      this.userLoadededEvent.emit(user);
    });
    this.manager.events.addUserLoaded((user) => {
      this.user = user;
    });
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

  isLoggedIn(): Observable<boolean> {
    console.log('isLoggedIn: check user');
    return Observable.fromPromise(this.manager.getUser())
      .map<User, boolean>((user) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      });
    // return !(this.user === undefined) && !this.user.expired;
  }

  getClaims(): any {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    if (this.user != null && this.user !== undefined) {
      return `${this.user.token_type} ${this.user.access_token}`;
    } else {
      console.log('getAuthorizationHeaderValue returned null');
      return undefined;
    }
  }

  startAuthentication(url): Promise<void> {
    // return this.manager.signinRedirect({ data: url }).catch(function (err) { console.log(err); });
    console.log('startAuthentication!');
    return this.manager.signinRedirect({ data: url }).catch(function (err) { console.log(err); });
  }

  completeAuthentication(): Promise<void> {
    console.log('completeAuthentication started!');
    const p = this.manager.signinRedirectCallback().then(user => {
      console.log('completeAuthentication completed :)');
      this.user = user;
    }, (error) => {
      console.log(error);
    }).catch(function (err) {
      console.log(err);
      throw new Error('signinRedirectCallback did not return the user' + err);
    });
    return p;
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
