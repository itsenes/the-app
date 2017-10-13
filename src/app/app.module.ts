import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from './material-module';
// https://github.com/damienbod/angular-auth-oidc-client
import { AuthModule, OidcSecurityService, OpenIDImplicitFlowConfiguration } from 'angular-auth-oidc-client';

import { AppComponent } from './app.component';
import { ShellComponent } from './layout/shell/shell.component';
import { SettingsComponent } from './features/settings/settings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { DocumentViewComponent } from './features/documents/document-view/document-view.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { StoreComponent } from './features/store/store.component';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';

// https://damienbod.com/2016/03/02/angular2-openid-connect-implicit-flow-with-identityserver4/
// http://continuousdeveloper.com/2016/07/06/protecting-routes-in-angular-2/
// http://onehungrymind.com/named-router-outlets-in-angular-2/
const appRoutes: Routes = [
  {
    path: 'home',
    component: DashboardComponent,
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: 'documents', component: DocumentsComponent },
  { path: 'documents/:typeId', component: DocumentViewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'store', component: StoreComponent },
  { path: '**', component: PageNotFoundComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forbidden', component: UnauthorizedComponent }
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
    StoreComponent,
    UnauthorizedComponent
  ],
  imports: [
    HttpModule,
    AuthModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public oidcSecurityService: OidcSecurityService) {
    const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
    openIDImplicitFlowConfiguration.stsServer = 'https://www.incontrl.io';
    openIDImplicitFlowConfiguration.redirect_url = 'http://localhost:4200';
    openIDImplicitFlowConfiguration.client_id = 'angularclient';
    openIDImplicitFlowConfiguration.response_type = 'id_token token';
    openIDImplicitFlowConfiguration.scope = 'openid,profile,email,phone,role,subscriptionId,membership,core,offline_access';
    openIDImplicitFlowConfiguration.post_logout_redirect_uri = 'http://localhost:4200/Unauthorized';
    openIDImplicitFlowConfiguration.start_checksession = false;
    openIDImplicitFlowConfiguration.silent_renew = true;
    openIDImplicitFlowConfiguration.silent_renew_offset_in_seconds = 0;
    openIDImplicitFlowConfiguration.startup_route = '/home';
    openIDImplicitFlowConfiguration.forbidden_route = '/forbidden';
    openIDImplicitFlowConfiguration.unauthorized_route = '/unauthorized';
    openIDImplicitFlowConfiguration.auto_userinfo = true;
    openIDImplicitFlowConfiguration.log_console_warning_active = true;
    openIDImplicitFlowConfiguration.log_console_debug_active = false;
    openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 10;
    openIDImplicitFlowConfiguration.override_well_known_configuration = false;
    // openIDImplicitFlowConfiguration.override_well_known_configuration_url = 'https://www.incontrl.io/.well-known/openid-configuration';
    // openIDImplicitFlowConfiguration.storage = localStorage;
    this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration);
  }
}
