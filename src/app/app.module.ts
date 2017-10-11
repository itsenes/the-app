import { NgModule } from '@angular/core';
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

// https://damienbod.com/2016/03/02/angular2-openid-connect-implicit-flow-with-identityserver4/

const appRoutes: Routes = [
  {
    path: 'home',
    component: DashboardComponent,
  },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: 'documents', component: DocumentsComponent },
  { path: 'documents/:id', component: DocumentViewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    DashboardComponent,
    DocumentsComponent,
    ShellComponent,
    DocumentViewComponent,
    PageNotFoundComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule, FormsModule, FlexLayoutModule, BrowserAnimationsModule, MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
