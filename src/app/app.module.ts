import { NgModule, Injectable, Inject } from '@angular/core';
import { HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { RequestOptionsArgs } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from './material-module';

import { AppComponent } from './app.component';
import { ShellComponent } from './layout/shell/shell.component';
import { SettingsComponent } from './features/settings/settings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { DocumentViewComponent } from './features/documents/document-view/document-view.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';

import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';

import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthCallbackComponent } from './common/auth-callback/auth-callback.component';
import { LoggedOutComponent } from './common/logged-out/logged-out.component';
import { SplashComponent } from './common/splash/splash.component';

import { GravatarModule } from 'ng2-gravatar-directive';
import { AccountSettingsComponent } from './features/account-settings/account-settings.component';
import { ApiClient } from './services/incontrl-apiclient';
import { AppStateService} from './services/app-state.service';
import { SubscriptionListComponent } from './common/subscription-list/subscription-list.component';
import { CompanyFormComponent } from './features/forms/company-form/company-form.component';

const appRoutes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'logged-out', component: LoggedOutComponent },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  {
    path: 'app', component: ShellComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'account', component: AccountSettingsComponent },
    ]
  },
  {
    path: 'app/:subscription-alias',
    component: ShellComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        children: [
          { path: '', component: DashboardComponent },
          { path: 'documents/:typeId', component: DocumentsComponent },
          { path: 'documents/:typeId/:documentId', component: DocumentViewComponent },
          { path: 'settings', component: SettingsComponent },
        ]
      }]
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forbidden', component: UnauthorizedComponent },
  { path: '**', component: PageNotFoundComponent }
];

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

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    SettingsComponent,
    DashboardComponent,
    DocumentsComponent,
    DocumentViewComponent,
    PageNotFoundComponent,
    UnauthorizedComponent,
    AuthCallbackComponent,
    LoggedOutComponent,
    SplashComponent,
    AccountSettingsComponent,
    SubscriptionListComponent,
    CompanyFormComponent
  ],
  imports: [
    HttpModule,
    RouterModule.forRoot(appRoutes),
    RouterModule.forChild(appRoutes),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule,
    GravatarModule
  ],
  providers: [AuthService, AuthGuardService, ApiClient,
    { provide: RequestOptions, useClass: SecureApiRequestOptions },
    AppStateService],
  bootstrap: [AppComponent]
})
export class AppModule { }

