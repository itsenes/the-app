import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';


import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../services/app-state.service';
import {
  ViewModelLocator, SubscriptionViewModel,
  DocumentTypeViewModel,
  DocumentViewModel
} from '../../../view-models/view-models';
import {
  Address,
  ApiClient,
  Contact,
  Document,
  DocumentLine,
  DocumentType,
  Organisation,
  Product,
  Recipient,
  Tax,
  TaxType, LookupEntry
} from '../../../services/incontrl-apiclient';
import { LookupsService } from '../../../services/lookups.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

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
  public readonly = true;
  public editcompany = false;
  public companyfilter;
  searchCompanyControl: FormControl = new FormControl();
  searchCurrencyControl: FormControl = new FormControl();
  filteredcompanies: Organisation[];
  currencies: LookupEntry[] = null;
  filteredcurrencies: LookupEntry[];
  newline: DocumentLine = new DocumentLine();
  showPane = true;
  showAddCompany = false;

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
    private apiClient: ApiClient, private sanitizer: DomSanitizer,
    private viewModelLocator: ViewModelLocator, private lookups: LookupsService) {
    const newdoc = this.expand(new Document());
    this.vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, newdoc);
  }

  displayCompanyFn(org: Organisation): string {
    return org ? org.name : '';
  }

  displayCurrencyFn(currrency: LookupEntry): string {
    return currrency ? currrency.description : '';
  }

  companyChanged(event) {
    if (this.model.recipient.organisation !== event.option.value) {
      this.model.recipient.organisation = event.option.value;
    }
    this.searchCompanyControl.setValue(null);
  }

  currencyChanged(event) {
    if (this.vm.currency !== event.option.value) {
      this.vm.currency = event.option.value;
    }
    // this.searchCurrencyControl.setValue(event.option.viewValue);
  }

  isObject(obj) {
    return obj === Object(obj);
  }

  ngOnInit() {
    this.lookups.currencies.subscribe((entries) => {
      this.currencies = entries;
    });

    this.searchCompanyControl.valueChanges.debounceTime(400)
      .distinctUntilChanged()
      .subscribe((filter) => {
        if (null !== filter && filter !== '') {
          this.apiClient.getOrganisations(this.subscription.id, 1, 100, true, false, undefined, undefined, filter)
            .subscribe((response) => {
              this.filteredcompanies = response.items;
            });
        }
      });


    this.searchCurrencyControl.valueChanges.debounceTime(400)
      .distinctUntilChanged().subscribe((filter: string) => {
        if (null !== filter && undefined !== filter && filter !== '' && !this.isObject(filter)) {
          alert(filter);
          this.filteredcurrencies = this.currencies.filter(c => c.description
            && c.description.toLowerCase().startsWith(filter.toLowerCase()));
        } else {
          this.filteredcurrencies = [];
        }
      });

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
    if (doc.recipient.organisation.address == null) {
      doc.recipient.organisation.address = new Address();
    }
    if (doc.recipient.contact == null) {
      doc.recipient.contact = new Contact();
    }
    if (doc.recipient.contact.address == null) {
      doc.recipient.contact.address = new Address();
    }
    if (doc.lines == null || doc.lines === undefined) {
      doc.lines = [];
    }
    doc.lines.forEach((line) => {
      if (line.product == null) {
        line.product = new Product();
      }
      if (line.taxes == null) {
        line.taxes = [];
      }
    });
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

  toggle_company_edit_mode() {
    this.editcompany = !this.editcompany;
  }

  private bak(value: any) {
    this._bak = value.clone();
  }

  cancel() {
    this.readonly = true;
    this.model = this._bak;
  }

  isnew() {
    return (null == this.model || this.model.id == null);
  }

  save() {
  }

  togglePanel() {
    this.showPane = !this.showPane;
  }

  removeline(index) {
  }

  addline() {
  }

  isEven(n) {
    return n % 2 === 0;
  }
}
