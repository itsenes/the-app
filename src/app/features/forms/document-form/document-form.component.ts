import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../services/app-state.service';
import { ViewModelLocator, SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../../view-models/view-models';
import { ApiClient, DocumentType, Document } from '../../../services/incontrl-apiclient';
import { LookupsService } from '../../../services/lookups.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  private params_sub = null;
  public subscription: SubscriptionViewModel = null;
  public documentType: DocumentTypeViewModel = null;
  private _model: DocumentViewModel = null;
  private _bak: DocumentViewModel = null;
  public readonly = true;

  public set model(value: DocumentViewModel) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): DocumentViewModel { return this._model; }

  constructor(private appState: AppStateService, private route: ActivatedRoute,
    private apiClient: ApiClient, private sanitizer: DomSanitizer, private viewModelLocator: ViewModelLocator) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub;
        const typeid = params['typeId'];
        const docid = params['documentId'];
        this.subscription.getDocumentType(typeid).subscribe((docType) => {
          this.documentType = docType;
          // get the document now!
          if ('new' === docid || null == docid) {
            this.model = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, new Document());
          } else {
            this.apiClient.getDocument(this.subscription.id, docid).subscribe((response) => {
              this.model = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, response);
            });
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  toggle_edit_mode() {
    this.readonly = !this.readonly;
    if (!this.readonly) {
      this.bak(this.model);
    }
  }

  private bak(value: any) {
    this._bak = value.clone();
  }

  cancel() {
    this.readonly = true;
    this.model = this._bak;
  }

  save() {

  }
}
