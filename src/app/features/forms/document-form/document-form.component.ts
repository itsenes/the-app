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
  ViewModelLocator,
  SubscriptionViewModel,
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
import { ENTER } from '@angular/cdk/keycodes';

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
  invoicedate: FormControl = new FormControl();
  invoicedueDate: FormControl = new FormControl();
  filteredcompanies: Organisation[];
  currencies: LookupEntry[] = null;
  filteredcurrencies: LookupEntry[];
  newline: DocumentLine = null;
  showPane = false;
  showAddCompany = false;
  products: any;

  // Enter, comma
  separatorKeysCodes = [ENTER];


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
  }

  duedateChanged(event) {
    this.model.dueDate = event.value;
  }

  dateChanged(event) {
    this.model.date = event.value;
  }

  toggleCompanyPanel() {
    this.showPane = !this.showPane;
    this.showAddCompany = !this.showAddCompany;
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
        if (this.isValidFilter(filter)) {
          this.apiClient.getOrganisations(this.subscription.id, 1, 100, true, false, undefined, undefined, filter)
            .subscribe((response) => {
              this.filteredcompanies = response.items;
            });
        }
      });


    this.searchCurrencyControl.valueChanges.debounceTime(400)
      .distinctUntilChanged().subscribe((filter: string) => {
        if (this.isValidFilter(filter)) {
          this.filteredcurrencies = this.currencies.filter(c => c.description
            && c.description.toLowerCase().startsWith(filter.toLowerCase()));
        }
      });


    this.params_sub = this.route.params.subscribe((params) => {
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub;
        const typeid = params['typeId'];
        const docid = params['documentId'];
        this.subscription.getDocumentType(typeid).subscribe((docType) => {
          this.documentType = docType;
          this.subscription.products.subscribe((items) => {
            this.products = items;
            // if no items then "Nothing else matters :)"

            // get the document now!
            if ('new' === docid || null == docid) {
              const doc = new Document();
              doc.currencyCode = this.subscription.company.model.currencyCode;
              doc.date = new Date();
              doc.dueDate = new Date();
              doc.lines = new Array<DocumentLine>();
              const newLine = new DocumentLine();
              newLine.unitAmount = 0;
              newLine.quantity = 0;
              newLine.discountRate = 0;
              doc.lines.push(newLine);
              const vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, doc);
              vm.init().subscribe(() => {
                this.vm = vm;
                this.initControls();
                this.readonly = false;
              });
            } else {
              this.apiClient.getDocument(this.subscription.id, docid).subscribe((doc) => {
                const vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, doc);
                vm.init().subscribe(() => {
                  this.vm = vm;
                  this.initControls();
                });
              });
            }

          });

        });
      });
    });
  }

  isValidFilter(filter: string): boolean {
    return null !== filter && undefined !== filter && filter !== '' && !this.isObject(filter);
  }

  initControls() {
    this.searchCurrencyControl.setValue(this.vm.currency, { onlySelf: true, emitEvent: false });
    this.invoicedate.setValue(this.model.date, { onlySelf: true, emitEvent: false });
    this.invoicedueDate.setValue(this.model.dueDate, { onlySelf: true, emitEvent: false });
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


  toggleTaxEditPanel(line: any) {
    this.showPane = !this.showPane;
    this.showAddCompany = !this.showAddCompany;
  }

  private bak(value: any) {
    this._bak = value.clone();
  }

  cancel() {
    this.readonly = true;
    this.model = this._bak;
    this.vm.init().subscribe(() => {
      this.initControls();
    });
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
