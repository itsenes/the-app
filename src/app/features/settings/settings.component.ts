import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { CompanyFormComponent } from '../forms/company-form/company-form.component';
import { AlertsService } from '@jaspero/ng2-alerts';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../features.components.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  subscriptionKey: any = null;
  subscription: any = {};
  company: any = {};
  params_sub: any = null;
  busy = false;
  constructor(private appState: AppStateService, private route: ActivatedRoute, private alertsService: AlertsService) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.busy = true;
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscriptionKey = params['subscription-alias'];
        this.subscription = sub;
        this.busy = false;
      });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  subscription_changed(model: any) {
    this.appState.getSubscriptionByKey(this.subscriptionKey).subscribe((sub) => {
      sub.data = model;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    });
  }

}
