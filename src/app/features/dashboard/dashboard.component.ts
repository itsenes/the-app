import { Component, OnInit, OnDestroy } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionViewModel, DocumentTypeViewModel } from '../../view-models/view-models';
import { environment } from '../../../environments/environment';

const default_columns = 4;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  columns = default_columns;
  user = null;
  subscription: SubscriptionViewModel;
  documentTypes: DocumentTypeViewModel[];
  private media_sub: any = null;
  private router_params_sub: any;
  api_url = environment.api_url;

  constructor(private media: ObservableMedia,
    private authService: AuthService,
    private appState: AppStateService,
    private route: ActivatedRoute) {
    this.user = authService.currentUser().profile;
  }

  ngOnInit() {
    this.media_sub = this.media.asObservable()
      .subscribe((change: MediaChange) => {
        console.log('media change (mqAlias): ' + change.mqAlias);
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else {
          this.columns = default_columns;
        }
      });

    this.router_params_sub = this.route.params.subscribe((params) => {
      const alias = params['subscription-alias'];
      if (null != alias) {
        this.appState.getSubscriptionByKey(alias).subscribe((sub) => {
          this.subscription = sub;
          this.subscription.documentTypes.subscribe((types) => {
            this.documentTypes = types;
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.media_sub.unsubscribe();
    this.router_params_sub.unsubscribe();
  }

}
