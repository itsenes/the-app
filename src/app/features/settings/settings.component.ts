import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  subscription: any = null;
  company: any = null;
  params_sub: any = null;
  busy = false;
  constructor(private appState: AppStateService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.busy = true;
      this.subscription = this.appState.subscriptions.find((sub) => sub.alias === params['subscription-alias']);
      this.company = this.subscription.company.clone();
      this.busy = false;
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }
}
