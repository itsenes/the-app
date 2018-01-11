import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'THE-APP';
  busy = true;

  constructor(private authService: AuthService, private router: Router, private translations: TranslateService) {
    const langs = ['el', 'en'];
    translations.addLangs(langs);
    translations.setDefaultLang('en');
    // TODO: check whether you find any locally persisted language setting for the user!
    console.log('BrowserCultureLang' + translations.getBrowserCultureLang() + ' getBrowserLang' + translations.getBrowserLang());
    const browserLang = translations.getBrowserLang();
    if (langs.findIndex(l => l === browserLang) >= 0) {
      translations.use(browserLang);
    }
  }

  switchLanguage(language: string) {
    this.translations.use(language);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }
}
