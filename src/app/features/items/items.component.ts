import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionViewModel } from '../../view-models/view-models';
import { ApiClient, UpdateSubscriptionCompanyRequest } from '../../services/incontrl-apiclient';
import { ConfirmationService } from '@jaspero/ng2-confirmations';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss', '../forms/forms.components.scss']
})
export class ItemsComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  private _bak: any = null;
  private _model: SubscriptionViewModel = null;
  public readonly = true;
  private busy = false;
  params_sub: any = null;
  products: any[] = [];
  norecords = false;
  currencyCode = 'EUR';

  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: SubscriptionViewModel) {
    this._model = value;
  }
  public get model(): SubscriptionViewModel { return this._model; }

  constructor(private alertsService: AlertsService,
    private route: ActivatedRoute,
    private appState: AppStateService,
    private apiClient: ApiClient,
    private confirmation: ConfirmationService) {
  }

  delete(item, index) {
    if (item.id == null) {
      this.model.products.subscribe((items) => {
        items.splice(index, 1);
        this.alertsService.create('success', 'Η διαγραφή του προϊόντος έγινε με επιτυχία!');
        this.norecords = (items == null || items.length === 0);
      });
    } else {
      // an einai kanonikh eggrafh
      this.confirmation.create('Διαγραφή προϊόντος', `Να γίνει η διαγραφή του προϊόντος ${item.name}`)
        .subscribe((ans) => {
          if (ans.resolved) {
            this.apiClient.deleteProduct(this.model.id, item.id)
              .subscribe(() => {
                this.model.products.subscribe((products) => {
                  products.splice(index, 1);
                  this.alertsService.create('success', 'Η διαγραφή του προϊόντος έγινε με επιτυχία!');
                });
              }, (error) => {
                this.alertsService.create('error', 'Σφάλμα κατα την διαγραφή! Μύνημα συστήματος: ' + error);
              });
          }
        });
    }
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((subscription) => {
          this.model = subscription;
          this.currencyCode = subscription.company.currencyCode;
          subscription.products.subscribe((products) => {
            this.products = products;
            this.norecords = (this.products == null || this.products.length === 0);
          });
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  add_new() {
    this.model.addProduct();
    this.norecords = false;
  }
}
