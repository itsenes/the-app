import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})

export class ShellComponent implements OnInit {
  constructor() {
  }
  isDarkTheme: boolean = false;
  navSize_Collapsed: string = '65px;';
  navSize_Extended: string = '240px;';
  navSize: string = this.navSize_Collapsed;

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
  }

}
