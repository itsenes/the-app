import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';

const nav_width_collapsed = '65px;';
const nav_width_extended = '240px;';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})

export class ShellComponent implements OnInit, OnDestroy {
  isDarkTheme = false;
  navSize = nav_width_collapsed;
  showAside = false;
  showNav = false;
  user = null;
  navLinks = [];
  subscription = null;
  private router_events_sub: any;
  private router_params_sub: any;
  constructor(private appState: AppStateService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.user = this.authService.currentUser().profile;
  }

  toggleNav(): void {
    this.showNav = !this.showNav;
    if (this.showNav) {
      this.navSize = nav_width_extended;
    } else {
      this.navSize = nav_width_collapsed;
    }
  }

  ngOnInit() {
    this.router_params_sub = this.route.params.subscribe((params) => {
      const alias = params['subscription-alias'];
      if (null != alias) {
        this.appState.subscriptions.subscribe((subs) => {
          this.subscription = subs[0]; // .find(s => s.alias === alias)[0];
          this.appState.selectSubscription(this.subscription);
          this.subscription.document_types.subscribe((types) => {
            this.navLinks = [
              { path: this.subscription.home_path, icon: 'home', label: 'Η εταιρεία μου' }
            ];
            if (types != null) {
              types.forEach((doc) => {
                this.navLinks.push({ path: doc.search_path, icon: 'folder', label: doc.name });
              });
            }
            this.navLinks.push({ path: this.subscription.settings_path, icon: 'settings', label: 'Ρυθμίσεις' });
          });
        });
      }
    });
    // build nav links for selected subscription
    // this.navLinks = [
    //   { path: this.appState.selected_subscription.home_path, icon: 'home', label: 'Η εταιρεία μου' }
    // ];
    // if (this.appState.document_types != null) {
    //   this.appState.document_types.forEach((doc) => {
    //     this.navLinks.push({ path: doc.search_path, icon: 'folder', label: doc.name });
    //   });
    // }
    // this.navLinks.push({ path: this.appState.selected_subscription.settings_path, icon: 'settings', label: 'Ρυθμίσεις' });

    // monitor navigation events to display progress!
    this.router_events_sub = this.router.events
      .subscribe((event) => {
        // example: NavigationStart, RoutesRecognized, NavigationEnd
        console.log(event);
        if (event instanceof NavigationStart) {
          console.log('Shell NavigationStart:', event);
        } else if (event instanceof NavigationEnd) {
          console.log('Shell NavigationStart:', event);
        }
      });
  }

  ngOnDestroy() {
    this.router_events_sub.unsubscribe();
    this.router_params_sub.unsubscribe();
  }

}
