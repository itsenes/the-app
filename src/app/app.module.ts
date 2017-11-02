// angular modules
import { NgModule, Injectable, Inject, Injector, ReflectiveInjector, InjectionToken } from '@angular/core';
import { HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
// 3rd party cool modules
import { MaterialModule } from './material-module';
import { GravatarModule } from 'ng2-gravatar-directive';
// https://jaspero.co/resources/projects/ng-alerts
import { JasperoAlertsModule } from '@jaspero/ng2-alerts';
// my own ui components
import { AppComponent } from './app.component';
import { ShellComponent } from './layout/shell/shell.component';
import { SettingsComponent } from './features/settings/settings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { DocumentViewComponent } from './features/documents/document-view/document-view.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { AuthCallbackComponent } from './common/auth-callback/auth-callback.component';
import { LoggedOutComponent } from './common/logged-out/logged-out.component';
import { SplashComponent } from './common/splash/splash.component';
import { AccountSettingsComponent } from './features/account-settings/account-settings.component';
import { SubscriptionListComponent } from './common/subscription-list/subscription-list.component';
// forms
import { CompanyFormComponent } from './features/forms/company-form/company-form.component';
// dialogs
import { SelectImageDialogComponent } from './common/dialogs/select-image-dialog/select-image-dialog.component';
// my services
import { AuthService, SecureApiRequestOptions } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AppStateService } from './services/app-state.service';
// 3rd party services!
import { ApiClient, API_BASE_URL } from './services/incontrl-apiclient';
// get a proper app + route config module at some point!
import { environment } from '../environments/environment';
// my api url factory method :)
export const getApiUrl = function() {
  return environment.api_url;
};

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
    CompanyFormComponent,
    SelectImageDialogComponent
  ],
  entryComponents: [SelectImageDialogComponent],
  imports: [
    HttpModule,
    RouterModule.forRoot(appRoutes),
    RouterModule.forChild(appRoutes),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule,
    GravatarModule,
    JasperoAlertsModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    ApiClient,
    { provide: RequestOptions, useClass: SecureApiRequestOptions },
    AppStateService,
    { provide: API_BASE_URL, useFactory: getApiUrl }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor() {
  }
}
