import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../services/app-state.service';
import { ViewModelLocator, SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../../view-models/view-models';
import { ApiClient, Document, DocumentType, Recipient, Contact, Organisation } from '../../../services/incontrl-apiclient';
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
  private _viewmodel: DocumentViewModel = null;
  private _model: Document = null;
  private _bak: Document = null;
  public readonly = false;

  /// viewmodel
  public set vm(value: DocumentViewModel) {
    this._viewmodel = value;
  }
  public get vm(): DocumentViewModel { return this._viewmodel; }

  public set model(value: Document) {
    this.vm.model = value;
  }

  public get model(): Document { return this.vm.model; }

  public get company(): Organisation {
    return this.vm.model.recipient.organisation;
  }

  public get contact(): Contact {
    return this.vm.model.recipient.contact;
  }

  constructor(private appState: AppStateService, private route: ActivatedRoute,
    private apiClient: ApiClient, private sanitizer: DomSanitizer, private viewModelLocator: ViewModelLocator) {
    const newdoc = this.expand(new Document());
    this.vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, newdoc);
  }

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
            const newdoc = this.expand(new Document());
            this.vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, newdoc);
          } else {
            this.apiClient.getDocument(this.subscription.id, docid).subscribe((doc) => {
              const vmdoc = this.expand(doc);
              this.vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, vmdoc);
            });
          }
        });
      });
    });
  }

  expand(doc: Document): Document {
    if (doc.recipient == null) {
      doc.recipient = new Recipient();
    }
    if (doc.recipient.organisation == null) {
      doc.recipient.organisation = new Organisation();
    }
    if (doc.recipient.contact == null) {
      doc.recipient.contact = new Contact();
    }
    return doc;
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
