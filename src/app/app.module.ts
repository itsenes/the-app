// angular modules
import { NgModule, Injectable, Inject, Injector, ReflectiveInjector, InjectionToken } from '@angular/core';
import { BrowserXhr, HttpModule, JsonpModule, Http, RequestOptions, BaseRequestOptions, RequestMethod, Headers } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
// 3rd party cool modules
import { MaterialModule } from './material-module';
import { MatNativeDateModule } from '@angular/material';
import { GravatarModule } from 'ng2-gravatar-directive';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
// https://jaspero.co/resources/projects/ng-alerts
import { JasperoAlertsModule } from '@jaspero/ng2-alerts';
import { JasperoConfirmationsModule } from '@jaspero/ng2-confirmations';
// my own ui components
import { AppComponent } from './app.component';
import { ShellComponent } from './layout/shell/shell.component';
import { SettingsComponent } from './features/settings/settings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { AuthCallbackComponent } from './common/auth-callback/auth-callback.component';
import { LoggedOutComponent } from './common/logged-out/logged-out.component';
import { AccountSettingsComponent } from './features/account-settings/account-settings.component';
import { SubscriptionListComponent } from './common/subscription-list/subscription-list.component';
import { DocumentTypesComponent } from './features/document-types/document-types.component';
import { ItemsComponent } from './features/items/items.component';

// forms
import { CompanyFormComponent } from './features/forms/company-form/company-form.component';
import { ContactFormComponent } from './features/forms/contact-form/contact-form.component';
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
import { DocumentTypeFormComponent } from './features/forms/document-type-form/document-type-form.component';
import { ItemFormComponent } from './features/forms/item-form/item-form.component';
import { ErrorComponent } from './common/error/error.component';
import { DocumentFormComponent } from './features/forms/document-form/document-form.component';
import { LookupsService } from './services/lookups.service';
import { ViewModelLocator, ServiceLocator } from './view-models/view-models';
import { SubscriptionFormComponent } from './features/forms/subscription-form/subscription-form.component';

// my api url factory method :)
export const getApiUrl = function () {
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
          { path: 'documents/:typeId/:documentId', component: DocumentFormComponent },
          { path: 'documents/:typeId/new', component: DocumentFormComponent },
          {
            path: 'settings', component: SettingsComponent, // subscription
            children: [
              { path: '', redirectTo: 'subscription', pathMatch: 'full' },
              { path: 'subscription', component: SubscriptionFormComponent },
              { path: 'company', component: CompanyFormComponent },
              { path: 'contact', component: ContactFormComponent },
              { path: 'document-types', component: DocumentTypesComponent },
              { path: 'items', component: ItemsComponent },
            ]
          },
        ]
      }]
  },
  { path: 'error', component: ErrorComponent },
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
    PageNotFoundComponent,
    UnauthorizedComponent,
    AuthCallbackComponent,
    LoggedOutComponent,
    AccountSettingsComponent,
    SubscriptionListComponent,
    CompanyFormComponent,
    SelectImageDialogComponent,
    ContactFormComponent,
    DocumentTypesComponent,
    ItemsComponent,
    DocumentTypeFormComponent,
    ItemFormComponent,
    ErrorComponent,
    DocumentFormComponent,
    SubscriptionFormComponent
  ],
  entryComponents: [SelectImageDialogComponent],
  imports: [
    HttpModule,
    RouterModule.forRoot(appRoutes),
    RouterModule.forChild(appRoutes),
    BrowserModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, BrowserAnimationsModule,
    MaterialModule,
    MatNativeDateModule,
    GravatarModule,
    JasperoAlertsModule,
    JasperoConfirmationsModule,
    NgProgressModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    ApiClient,
    AppStateService,
    LookupsService,
    ViewModelLocator,
    ServiceLocator,
    { provide: RequestOptions, useClass: SecureApiRequestOptions },
    { provide: BrowserXhr, useClass: NgProgressBrowserXhr },
    { provide: API_BASE_URL, useFactory: getApiUrl }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor() {
  }
}
