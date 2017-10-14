import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})

export class ShellComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {
  }
  isDarkTheme = false;
  navSize_Collapsed = '65px;';
  navSize_Extended = '240px;';
  navSize = this.navSize_Collapsed;

  showAside = false;
  showNav = false;

  title = 'THE-APP';

  toggleNav(): void {
    this.showNav = !this.showNav;
    if (this.showNav) {
      this.navSize = this.navSize_Extended;
    } else {
      this.navSize = this.navSize_Collapsed;
    }
  }

  ngOnInit() {
    this.router.events
      .subscribe((event) => {
        // example: NavigationStart, RoutesRecognized, NavigationEnd
        console.log(event);
        if (event instanceof NavigationStart) {
          console.log('Shell NavigationStart:', event);
        }
      });
  }

}
