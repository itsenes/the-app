import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';
import { AlertSettings } from '@jaspero/ng2-alerts';
import { NgProgress } from 'ngx-progressbar';

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
  public busy = false;
  private router_events_sub: any;
  private router_params_sub: any;
  alertSettings: AlertSettings = {
    overlay: true,
    overlayClickToClose: true,
    showCloseButton: false,
    duration: 3000
  };
  confirmOptions: any = {
    overlay: true,
    overlayClickToClose: false,
    showCloseButton: false,
    confirmText: 'ΝΑΙ',
    declineText: 'OXI'
  };
  constructor(private appState: AppStateService, private authService: AuthService, private router: Router,
    private route: ActivatedRoute, private ngProgress: NgProgress) {
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
      let getsub = null;
      if (null != alias) {
        getsub = this.appState.getSubscriptionByKey(alias);
      } else {
        getsub = this.appState.current_subscription;
      }
      // if i did get a valid observable
      if (null != getsub) {
        getsub.subscribe((sub) => {
          // set this subscription as "current"
          this.subscription = sub;
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

      // monitor navigation events to display progress!
      this.router_events_sub = this.router.events
        .subscribe((event) => {
          // example: NavigationStart, RoutesRecognized, NavigationEnd
          console.log(event);
          if (event instanceof NavigationStart) {
            this.busy = true;
            // this.ngProgress.start();
            console.log('Shell NavigationStart:', event);
          } else if (event instanceof NavigationEnd) {
            this.busy = false;
            console.log('Shell NavigationEnd:', event);
            // this.ngProgress.done();
          }
        });
    });
  }

  ngOnDestroy() {
    this.router_events_sub.unsubscribe();
    this.router_params_sub.unsubscribe();
  }

}
