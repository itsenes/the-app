import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService, SubscriptionViewModel } from '../../services/app-state.service';
import { ApiClient, UpdateSubscriptionCompanyRequest } from '../../services/incontrl-apiclient';
import { ConfirmationService } from '@jaspero/ng2-confirmations';
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
  norecords = false;
  document_types: any[];

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

  delete(documentType, index) {
    if (documentType.id == null) {
      this.model.document_types.subscribe((types) => {
        types.splice(index, 1);
        this.alertsService.create('success', 'Η διαγραφή του τύπου εγγράφων έγινε με επιτυχία!');
        this.norecords = (types == null || types.length === 0);
      });
    } else {
      // an einai kanonikh eggrafh
      this.confirmation.create('Διαγραφή τύπου εγγράφου', `Να γίνει η διαγραφή του τύπου εγγράφου ${documentType.name}`)
        .subscribe((ans) => {
          if (ans.resolved) {
            this.apiClient.deleteDocumentType(this.model.id, documentType.id)
              .subscribe(() => {
                this.model.document_types.subscribe((types) => {
                  types.splice(index, 1);
                  this.alertsService.create('success', 'Η διαγραφή του τύπου εγγράφων έγινε με επιτυχία!');
                  this.norecords = (types == null || types.length === 0);
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
          subscription.document_types.subscribe((types) => {
            this.document_types = types;
            this.norecords = (this.document_types == null || this.document_types.length === 0);
          });
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  add_new() {
    this.model.add_document_type();
    this.norecords = false;
  }
}

