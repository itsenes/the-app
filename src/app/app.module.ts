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
    RouterModule.forRoot(appRoutes),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}

