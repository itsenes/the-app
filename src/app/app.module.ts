import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule, Http } from '@angular/http';
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
import { StoreComponent } from './features/store/store.component';

import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';

import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthCallbackComponent } from './common/auth-callback/auth-callback.component';
import { LoggedOutComponent } from './common/logged-out/logged-out.component';

// http://continuousdeveloper.com/2016/07/06/protecting-routes-in-angular-2/
// http://onehungrymind.com/named-router-outlets-in-angular-2/
const appRoutes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        children: [
          { path: '', component: DashboardComponent },
          { path: 'documents', component: DocumentsComponent },
          { path: 'documents/:typeId', component: DocumentViewComponent },
          { path: 'settings', component: SettingsComponent },
          { path: 'store', component: StoreComponent },
        ]
      }]
  },
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
    UnauthorizedComponent,
    AuthCallbackComponent,
    LoggedOutComponent
  ],
  imports: [
    HttpModule,
    RouterModule.forRoot(appRoutes, { enableTracing: true }),
    RouterModule.forChild(appRoutes),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule
  ],
  providers: [AuthService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }

