import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { Router, ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../services/app-state.service';
import {
  ViewModelLocator,
  SubscriptionViewModel,
  DocumentTypeViewModel,
  DocumentViewModel, TaxDefinitionViewModel
} from '../../../view-models/view-models';
import {
  ApiClient,
  Address, Contact, Document, DocumentLine, DocumentType, Organisation,
  Product, Recipient, Tax, TaxAmount, TaxType, TaxAmountType, LookupEntry,
  UpdateDocumentRequest, CreateDocumentRequest, TaxDefinition, DocumentStatus
} from '../../../services/incontrl-apiclient';
import { LookupsService } from '../../../services/lookups.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { ENTER } from '@angular/cdk/keycodes';
import { AlertsService } from '@jaspero/ng2-alerts';
import { environment } from '../../../../environments/environment.azure-dev';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { ConfirmationService } from '@jaspero/ng2-confirmations';
import { Location } from '@angular/common';

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
  taxes: Array<TaxDefinitionViewModel> = null;
  salesTaxes: Array<TaxDefinitionViewModel> = null;
  nonSalesTaxes: Array<TaxDefinitionViewModel> = null;
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
    this.vm.data = value;
  }
  public get model(): Document { return this.vm.data; }

  public get company(): Organisation {
    return this.vm.data.recipient.organisation;
  }

  public get contact(): Contact {
    return this.vm.data.recipient.contact;
  }

  constructor(private appState: AppStateService, private route: ActivatedRoute,
    private apiClient: ApiClient, private sanitizer: DomSanitizer,
    private viewModelLocator: ViewModelLocator, private lookups: LookupsService,
    private alertsService: AlertsService,
    private confirmation: ConfirmationService, private router: Router, private location: Location) {
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

  toggleCompanyPanel(isnew?) {
    if (isnew) {
      this.model.recipient.organisation = new Organisation();
    }
    this.showPane = !this.showPane;
    this.showAddCompany = !this.showAddCompany;
  }

  isObject(obj) {
    return obj === Object(obj);
  }

  ngOnInit() {
    this.searchCompanyControl.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe((filter) => {
        if (this.isValidFilter(filter)) {
          this.apiClient.getOrganisations(this.subscription.id, 1, 100, true, false, undefined, undefined, filter)
            .subscribe((response) => {
              this.filteredcompanies = response.items;
            });
        }
      });

    this.searchCurrencyControl.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe((filter: string) => {
        if (this.isValidFilter(filter)) {
          this.filteredcurrencies = this.currencies.filter(c => c.description
            && c.description.toLowerCase().startsWith(filter.toLowerCase()));
        }
      });

    this.params_sub = this.route.params.subscribe((params) => {
      const typeid = params['typeId'];
      const docid = params['documentId'];
      const alias = params['subscription-alias'];

      this.appState.getSubscriptionByKey(alias).subscribe((subcription) => {
        this.subscription = subcription;
        const load = Observable.forkJoin(
          this.lookups.currencies,
          this.subscription.products,
          this.subscription.getDocumentType(typeid),
          this.subscription.taxes
        );

        load.subscribe((result) => {
          this.currencies = result[0];
          this.products = result[1];
          this.documentType = result[2];
          this.taxes = result[3];
          this.salesTaxes = this.taxes.filter(t => t.isSalesTax);
          this.nonSalesTaxes = this.taxes.filter(t => !t.isSalesTax);
          // init the vm here!
          if ('new' === docid || null == docid) {
            const doc = this.getNewDocument();
            const vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, doc);
            vm.documentType = this.documentType;
            vm.init().subscribe(() => {
              this.vm = vm;
              this.initControls();
              this.readonly = false;
            }, (error) => {
              alert('vm.init()' + error);
              this.appState.onError(error);
            });
          } else {
            this.apiClient.getDocument(this.subscription.id, docid).subscribe((doc) => {
              const vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, doc);
              vm.documentType = this.documentType;
              vm.init().subscribe(() => {
                this.vm = vm;
                this.initControls();
              }, (error) => {
                alert('vm.init()' + error);
                this.appState.onError(error);
              });
            }, (error) => {
              alert('load' + error);
              this.appState.onError(error);
            });
          }
        }, (error) => {
          alert('initial load' + error);
          this.appState.onError(error);
        });
      }, (error) => {
        alert(' getSubscriptionByKey ' + error);
        this.appState.onError(error);
      });
    }, (error) => {
      alert(' params sub ' + error);
      this.appState.onError(error);
    });
  }

  getNewDocument(): Document {
    const doc = new Document();
    doc.status = DocumentStatus.Draft;
    doc.currencyCode = this.subscription.company.data.currencyCode;
    doc.typeId = this.documentType.id;
    doc.date = new Date();
    doc.dueDate = new Date();
    doc.lines = new Array<DocumentLine>();
    const newLine = new DocumentLine();
    newLine.unitAmount = 0;
    newLine.quantity = 0;
    newLine.discountRate = 0;
    doc.lines.push(newLine);
    return doc;
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
    if (null != this.params_sub) {
      this.params_sub.unsubscribe();
    }
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
    if (this.isnew()) {
      this.location.back();
      return;
    }
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
    let action: Observable<Document> = null;
    let redirect = false;
    if (!this.isnew()) {
      const request: UpdateDocumentRequest = new UpdateDocumentRequest();
      request.date = this.model.date;
      request.dueDate = this.model.dueDate;
      request.currencyCode = this.model.currencyCode;
      request.lines = new Array<DocumentLine>();
      this.vm.lines.forEach((line) => {
        const newline = new DocumentLine();
        newline.description = line.data.description;
        newline.unitAmount = line.unitAmount;
        newline.quantity = line.quantity;
        newline.discount = line.data.discount;
        newline.taxes = new Array<TaxAmount>();
        if (line.taxes) {
          line.taxes.forEach((tax) => {
            const taxdata = new TaxAmount();
            taxdata.init(tax);
            newline.taxes.push(taxdata);
          });
        }
        if (line.product) {
          newline.product = line.product.data.clone();
        }
        request.lines.push(newline);
      });
      request.number = this.model.number;
      request.paymentCode = this.model.paymentCode;
      request.recipient = this.model.recipient;
      request.serverCalculations = true;
      action = this.apiClient.updateDocument(this.subscription.id, this.model.id, request);
    } else {
      redirect = true;
      const request: CreateDocumentRequest = new CreateDocumentRequest();
      request.typeId = this.documentType.id;
      request.date = this.model.date;
      request.dueDate = this.model.dueDate;
      request.currencyCode = this.model.currencyCode;
      request.lines = new Array<DocumentLine>();
      this.vm.lines.forEach((line) => {
        const newline = new DocumentLine();
        newline.description = line.data.description;
        newline.unitAmount = line.unitAmount;
        newline.quantity = line.quantity;
        newline.discount = line.data.discount;
        newline.taxes = new Array<TaxAmount>();
        if (line.taxes) {
          line.taxes.forEach((tax) => {
            const taxdata = new TaxAmount();
            taxdata.init(tax);
            newline.taxes.push(taxdata);
          });
        }
        if (line.product) {
          newline.product = line.product.data.clone();
        }
        request.lines.push(newline);
      });
      request.number = this.model.number;
      request.paymentCode = this.model.paymentCode;
      request.recipient = this.model.recipient;
      request.serverCalculations = true;
      action = this.apiClient.createDocument(this.subscription.id, request);
    }
    action.subscribe((document) => {
      this.readonly = true; // end editing
      this.model = document;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
      if (redirect) {
        console.log(this.vm.viewPath);
        this.router.navigateByUrl(this.vm.viewPath);
      }
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error + ' ' + error.response);
    });
  }

  togglePanel() {
    this.showPane = !this.showPane;
  }

  removeline(index) {
    this.confirmation.create('Διαγραφή', `Να γίνει η διαγραφή της γραμμής ${index + 1};`)
      .subscribe((ans) => {
        if (ans.resolved) {
          this.vm.removeline(index);
        }
      });
  }

  addline() {
    this.vm.addline(0);
  }

  isEven(n) {
    return n % 2 === 0;
  }
}
