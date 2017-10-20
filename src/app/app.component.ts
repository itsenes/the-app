import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'THE-APP';
  busy = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }
}
