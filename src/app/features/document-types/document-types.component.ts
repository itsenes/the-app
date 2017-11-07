import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService, SubscriptionViewModel } from '../../services/app-state.service';
import { ApiClient, UpdateSubscriptionCompanyRequest } from '../../services/incontrl-apiclient';

@Component({
  selector: 'app-document-types',
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.scss', '../forms/forms.components.scss']
})
export class DocumentTypesComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  private _bak: any = null;
  private _model: SubscriptionViewModel = null;
  public readonly = true;
  private busy = false;
  params_sub: any = null;

  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: SubscriptionViewModel) {
    this._model = value;
  }
  public get model(): SubscriptionViewModel { return this._model; }

  constructor(private alertsService: AlertsService,
    private route: ActivatedRoute,
    private appState: AppStateService,
    private apiClient: ApiClient) {
  }

  delete(documentType, index) {
    this.apiClient.deleteDocumentType(this.model.id, documentType.id)
      .subscribe(() => {
        this.model.document_types.subscribe((types) => {
          types.splice(index, 1);
        });
      });
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((subscription) => {
          this.model = subscription;
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  add_new() {
    this.model.add_document_type();
  }
}

