import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { CompanyFormComponent } from '../forms/company-form/company-form.component';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  subscription: any = {};
  company: any = {};
  params_sub: any = null;
  busy = false;
  constructor(private appState: AppStateService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.busy = true;
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub.model;
        this.busy = false;
      });
      // this.company = this.subscription.company.clone();
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }
}
