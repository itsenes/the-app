import { _document } from '@angular/platform-browser/src/browser';
import { NgModule, Injectable, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { groupBy } from 'rxjs/operator/groupBy';
import {
  ApiClient, Subscription, LookupEntry, DocumentType,
  Product, Tax, TaxAmount, Document, Plan, Recipient, Organisation, Contact,
  DocumentLine, Address, DocumentStatus, TaxAmountType,
  DocumentCalculationRequest, DocumentCalculationResult,
  PricedLine, TaxType, TaxDefinition, DocumentTypeRecordType,
  RecordType, CreateDocumentTypeRequestRecordType
} from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';
import { LookupsService } from '../services/lookups.service';
import { FormControl } from '@angular/forms';
import { retry } from 'rxjs/operator/retry';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

// what you need the service locator will provide...
@Injectable()
export class ServiceLocator {
  constructor(public apiClient: ApiClient, public lookups: LookupsService, public sanitizer: DomSanitizer) {
  }
}

export class ViewModel<T> {
  constructor() {
  }

  private _basePath: string = null;
  public get basePath() {
    return this._basePath;
  }
  public set basePath(value: string) {
    this._basePath = value;
  }

  private _serviceLocator: ServiceLocator = null;
  public get serviceLocator(): ServiceLocator {
    return this._serviceLocator;
  }

  public set serviceLocator(value: ServiceLocator) {
    this._serviceLocator = value;
  }

  public get lookups(): LookupsService {
    return this.serviceLocator.lookups;
  }

  private _data: T = null;
  public get data(): T {
    return this._data;
  }

  public set data(value: T) {
    this._data = value;
  }

  protected init() { }

  getClassName() {
    const comp: any = this.constructor;
    return comp.name;
  }

  asObservable<TObservable>(value?: TObservable) {
    return Observable.create((observer) => {
      observer.next(value);
      observer.complete();
    });
  }

  round(numberValue, decimalPlaces) {
    const scale = Math.pow(10, decimalPlaces);
    return Math.round(scale * numberValue) / scale;
  }
}

@Injectable()
export class ViewModelLocator {
  constructor(private serviceLocator: ServiceLocator) {
  }
  private _basePath: string = null;
  public get basePath() {
    return this._basePath;
  }
  public set basePath(value: string) {
    this._basePath = value;
  }

  public getInstance<TViewModel extends ViewModel<T>, T>(type: { new(): TViewModel; }, data: T): TViewModel {
    const vm = new type();
    vm.serviceLocator = this.serviceLocator;
    vm.basePath = this.basePath;
    vm.data = data;
    console.log('getinstance -' + vm.getClassName() + ' homepath in resolved vm: ' + vm.basePath);
    return vm;
  }
}

export class SubscriptionViewModel extends ViewModel<Subscription> {
  private _documentTypes: DocumentTypeViewModel[];
  private _products: any[];
  private _plan: Plan;
  private _members: any[];
  private _taxes: TaxDefinitionViewModel[];

  constructor() {
    super();
  }

  public get id() {
    return this.data.id;
  }

  public get alias() {
    return this.data.alias;
  }

  public get status() {
    return this.data.status;
  }

  public get contact() {
    return this.data.contact;
  }

  private _company: OrganisationViewModel;
  public get company() {
    if (null == this._company) {
      this._company = new OrganisationViewModel();
      this._company.basePath = this.basePath;
      this._company.data = this.data.company;
      this._company.serviceLocator = this.serviceLocator;
    }
    return this._company;
  }

  public get companyLogo() {
    return `${environment.api_url}/subscriptions/${this.data.id}/image?size=64`;
  }

  public get basePath() {
    return this.homePath;
  }
  // no setter that is...
  public set basePath(value: string) { }

  public get homePath() {
    return `/app/${this.data.alias}`;
  }

  public get settingsPath() {
    return `/app/${this.data.alias}/settings`;
  }

  public get documentTypes(): Observable<DocumentTypeViewModel[]> {
    if (null == this._documentTypes) {
      return this.loadDocumentTypes();
    }
    return this.asObservable(this._documentTypes);
  }

  getDocumentType(id) {
    return this.documentTypes.map((s) => {
      return s.find(doc => doc.id === id);
    });
  }

  // todo:rename
  addDocumentType() {
    // each vm requires 3 things: data (model), a servicelocator and the parent path (which contains the subscription alias)
    const vm = new DocumentTypeViewModel();
    vm.serviceLocator = this.serviceLocator;
    vm.basePath = this.basePath;
    vm.data = new Document();
    this._documentTypes.push(vm);
  }

  loadDocumentTypes(): Observable<DocumentTypeViewModel[]> {
    return this.serviceLocator.apiClient.getDocumentTypes(this.id, 1, 100)
      .map((response) => {
        if (response.count === 0) {
          this._documentTypes = DocumentTypeViewModel[0];
        } else {
          this._documentTypes = response.items.
            map((doc) => {
              const vm = new DocumentTypeViewModel();
              vm.serviceLocator = this.serviceLocator;
              vm.basePath = this.basePath;
              vm.data = doc;
              return vm;
            });
          return this._documentTypes;
        }
      });
  }

  public get products(): Observable<any[]> {
    if (null == this._products) {
      return this.loadProducts();
    }
    return this.asObservable(this._products);
  }

  getProduct(id) {
    return Observable.create((observer) => {
      observer.next(this._products.find(item => item.id === id));
      observer.complete();
    });
  }

  addProduct() {
    const product = new Product();
    this._products.push({
      model: product
    });
  }

  loadProducts(): Observable<any> {
    return this.serviceLocator.apiClient.getProducts(this.id, 1, 100)
      .map((response) => {
        if (response.count === 0) {
          this._products = [];
        } else {
          this._products = response.items.
            map((product) => {
              const vm = new ProductViewModel();
              vm.basePath = this.basePath;
              vm.serviceLocator = this.serviceLocator;
              vm.data = product;
              return vm;
            });
        }
        return this._products;
      });
  }

  public get plan(): Observable<Plan> {
    if (null == this._plan) {
      return this.loadPlan();
    } else {
      return this.asObservable(this._plan);
    }
  }

  private loadPlan(): Observable<Plan> {
    return this.serviceLocator.apiClient.getSubscriptionPlan(this.id).map((plan) => {
      this._plan = plan;
      return this._plan;
    });
  }

  public get taxes(): Observable<TaxDefinitionViewModel[]> {
    if (null == this._taxes) {
      return this.loadTaxes();
    } else {
      return this.asObservable(this._taxes);
    }
  }

  private loadTaxes(): Observable<TaxDefinitionViewModel[]> {
    return this.serviceLocator.apiClient.getTaxes(this.id, 1, 100).map((result) => {
      this._taxes = result.items.map((item) => {
        const vm = new TaxDefinitionViewModel();
        vm.basePath = this.basePath;
        vm.serviceLocator = this.serviceLocator;
        vm.data = item;
        return vm;
      });
      return this._taxes;
    });
  }

  addTax() {
    const taxVM = new TaxDefinitionViewModel();
    taxVM.basePath = this.basePath;
    taxVM.serviceLocator = this.serviceLocator;
    taxVM.data = new TaxDefinition();
    this._taxes.push(taxVM);
  }
}

export class OrganisationViewModel extends ViewModel<Organisation> {
  constructor() {
    super();
  }

  public get id() {
    return this.data.id;
  }

  public get name() {
    return this.data.name;
  }

  public get legalName() {
    return this.data.legalName;
  }

  public get logo() {
    if (null == this.data.logoPath) {
      return `${environment.api_url}/subscriptions/${this.id}/image?size=64`;
    } else if (this.data.logoPath.indexOf('http') >= 0) {
      return this.data.logoPath;
    } else {
      return `${environment.api_url}/${this.data.logoPath}`;
    }
  }

  private _currency: LookupEntry;
  public get currency(): LookupEntry {
    return this._currency;
  }

  public set currency(value: LookupEntry) {
    this._currency = value;
    this.data.currencyCode = value ? value.id : undefined;
  }

}

export class DocumentTypeViewModel extends ViewModel<DocumentType> {
  constructor() {
    super();
  }

  public get id() {
    return this.data.id;
  }

  public get folder() {
    return this.data.code;
  }

  public get name() {
    return this.data.name;
  }

  public get notes() {
    return this.data.notes;
  }

  public get recordTypeText() {
    if (null != this.data) {
      switch (this.data.recordType) {
        case DocumentTypeRecordType.AccountsPayable:
          return 'Έξοδα';
        case DocumentTypeRecordType.AccountsReceivable:
          return 'Έσοδα';
        default:
          return '';
      }
    } else {
      return '';
    }
  }

  public getCreateRecordType(): CreateDocumentTypeRequestRecordType {
    switch (this.data.recordType) {
      case DocumentTypeRecordType.AccountsPayable:
        return CreateDocumentTypeRequestRecordType.AccountsPayable;
      case DocumentTypeRecordType.AccountsReceivable:
        return CreateDocumentTypeRequestRecordType.AccountsReceivable;
      default:
        return CreateDocumentTypeRequestRecordType.AccountsReceivable;
    }
  }

  public get alias() {
    return this.data.code;
  }

  public get searchPath() {
    return `${this.basePath}/documents/${this.id}`;
  }

  public get addNewPath() {
    return `${this.basePath}/documents/${this.id}/new`;
  }
}

export class TaxDefinitionViewModel extends ViewModel<TaxDefinition> {
  constructor() {
    super();
  }

  public get rateText(): number {
    const rate = this.round(this.data.rate * 100, 2);
    return rate;
  }

  public get rate(): number {
    return this.data.rate;
  }

  public set rate(value: number) {
    this.data.rate = value;
  }

  public get id() {
    return this.data.id;
  }

  public get type() {
    return this.data.type;
  }
  public set type(value) {
    this.data.type = value;
  }

  public get taxType() {
    switch (this.data.code) {
      case 'VAT': {
        return 'Φόρος προστιθέμενης αξίας πώλησης αγαθών ή παροχής υπηρεσιών (ΦΠΑ)';
      }
      case 'DEDUCTABLE': {
        return 'Κρατήσεις, παρακρατήσεις, εισφορές, χαρτόσημα, κτλ';
      }
      default: {
        return 'Άλλος τύπος φόρου';
      }
    }
  }

  public get code() {
    return this.data.code;
  }
  public set code(value) {
    this.data.code = value;
  }

  public get name() {
    return this.data.name;
  }
  public set name(value) {
    this.data.name = value;
  }

  public get isSalesTax() {
    return this.data.isSalesTax;
  }
  public set isSalesTax(value) {
    this.data.isSalesTax = value;
  }

  public get displayName() {
    return this.data.displayName;
  }
}

export class ProductViewModel extends ViewModel<Product> {
  constructor() {
    super();
  }

  public get id() {
    return this.data.id;
  }

  public get code() {
    return this.data.code;
  }

  public get name() {
    return this.data.name;
  }

  public get notes() {
    return this.data.notes;
  }

  public get searchPath() {
    return `${this.basePath}/items/${this.id}`;
  }

  public get addNewPath() {
    return `${this.basePath}/items/new`;
  }
}

export class DocumentViewModel extends ViewModel<Document> {
  private _salesTaxes: Array<Tax>;
  private _nonSalesTaxes: Array<Tax>;
  private _documentType: DocumentTypeViewModel = null;
  private _currency: LookupEntry;
  private _safePortalLink: SafeResourceUrl = null;
  private _statusText: string = null;
  constructor() {
    super();
  }

  public get documentType(): DocumentTypeViewModel {
    return this._documentType;
  }

  public set documentType(value: DocumentTypeViewModel) {
    this._documentType = value;
  }

  public get id() {
    return this.data.id;
  }

  public get displayName() {
    if (!this.data || !this.data.id || !this.data.numberPrintable) {
      return `${this.statusText} ${this.data.date.toLocaleString()}`;
    } else {
      return this.data.numberPrintable;
    }
  }

  public get hasCompany() {
    return (this.data && this.data.recipient && this.data.recipient.organisation);
  }

  public get hasContact() {
    return (this.data && this.data.recipient && this.data.recipient.contact);
  }

  public get recipientName() {
    if (this.hasCompany) {
      return this.data.recipient.organisation.name;
    } else if (this.hasContact) {
      return this.data.recipient.contact.displayName;
    } else {
      return '';
    }
  }

  public get recipientName1() {
    if (this.hasCompany) {
      return this.data.recipient.organisation.legalName;
    } else if (this.hasContact) {
      return this.data.recipient.contact.email;
    } else {
      return '';
    }
  }

  public get folder() {
    return this.documentType.folder;
  }

  public get statusText() {
    if (null == this._statusText) {
      switch (this.data.status) {
        case DocumentStatus.Draft:
          this._statusText = 'ΠΡΟΧΕΙΡΟ';
          break;
        case DocumentStatus.Deleted:
          this._statusText = 'ΔΙΕΓΡΑΜΜΕΝΟ';
          break;
        case DocumentStatus.Issued:
          this._statusText = 'ΕΧΕΙ ΑΠΟΣΤΑΛΕΙ';
          break;
        case DocumentStatus.Overdue:
          this._statusText = 'ΣΕ ΚΑΘΥΣΤΕΡΗΣΗ';
          break;
        case DocumentStatus.Paid:
          this._statusText = 'ΕΧΕΙ ΕΞΟΦΛΗΘΕΙ';
          break;
        case DocumentStatus.Partial:
          this._statusText = 'ΕΚΚΡΕΜΕΙ ΕΞΟΦΛΗΣΗ';
          break;
        case DocumentStatus.Void:
          this._statusText = 'ΑΚΥΡΩΜΕΝΟ';
          break;
        default:
          this._statusText = '';
      }
    }
    return this._statusText;
  }

  public get currency(): LookupEntry {
    return this._currency;
  }

  public set currency(value: LookupEntry) {
    this._currency = value;
    this.data.currencyCode = value ? value.id : undefined;
  }

  public get portalLink() {
    return `${environment.api_url}${this.data.permaLink}`;
  }
  public get portalDocLink() {
    return `${environment.api_url}${this.data.permaLink}.docx`;
  }
  public get portalPdfLink() {
    return `${environment.api_url}${this.data.permaLink}.pdf`;
  }
  public get safePortalLink() {
    if (null == this._safePortalLink) {
      this._safePortalLink = this.serviceLocator.sanitizer.bypassSecurityTrustResourceUrl(this.portalLink);
    }
    return this._safePortalLink;
  }

  public get companyLogo(): string {
    if (this.hasCompany
      && this.data.recipient.organisation.logoPath
      && this.data.recipient.organisation.logoPath !== '') {
      return this.data.recipient.organisation.logoPath;
    } else {
      return 'assets/images/icon-business.png';
    }
  }

  public get editPath() {
    return `${this.basePath}/documents/${this.documentType.id}/${this.id}?edit`;
  }
  public get viewPath() {
    return `${this.basePath}/documents/${this.documentType.id}/${this.id}`;
  }
  public get addNewPath() {
    return `${this.basePath}/documents/new`;
  }

  private _lines: Array<DocumentLineViewModel>;
  public get lines(): Array<DocumentLineViewModel> {
    return this._lines;
  }
  public set lines(value: Array<DocumentLineViewModel>) {
    this._lines = value;
  }

  public removeline(index) {
    this.data.lines.splice(index, 1);
    this.lines.splice(index, 1);
  }

  public addline(index) {
    const newline = new DocumentLineViewModel();
    newline.data = new DocumentLine();
    newline.serviceLocator = this.serviceLocator;
    newline.basePath = this.basePath;
    newline.unitAmount = 0;
    newline.quantity = 0;
    newline.discountRate = 0;
    this.lines.push(newline);
    this.calcTotals();
  }

  public get salesTaxes(): any {
    return this._salesTaxes;
  }
  public set salesTaxes(value: any) {
    this._salesTaxes = value;
  }

  public get nonSalesTaxes(): any {
    return this._nonSalesTaxes;
  }
  public set nonSalesTaxes(value: any) {
    this._nonSalesTaxes = value;
  }

  private groupAndSumTaxes(array: TaxAmount[]) {
    const result = [];
    array.reduce(function (res, value) {
      if (!res[value.name]) {
        res[value.name] = {
          amount: 0,
          name: value.name
        };
        result.push(res[value.name]);
      }
      res[value.name].amount += value.amount;
      return res;
    }, {});
    return result;
  }

  public calcTotals() {
    this.data.subTotal = 0;
    this.data.totalSalesTax = 0;
    this.data.totalTax = 0;
    this.data.total = 0;
    this.data.totalPayable = 0;
    const salesTaxes = new Array<TaxAmount>();
    const nonSalesTaxes = new Array<TaxAmount>();
    // https://coderwall.com/p/kvzbpa/don-t-use-array-foreach-use-for-instead
    this.lines.forEach((line) => {
      this.data.subTotal = this.data.subTotal + line.subTotal;
      this.data.totalSalesTax = this.data.totalSalesTax + line.totalSalesTax;
      this.data.total = this.data.total + line.total;
      this.data.totalTax = this.data.totalTax + line.totalTax;
      this.data.totalPayable = this.data.totalPayable + (line.total + line.totalTax);
      // update taxes list...
      line.taxes.forEach((tax) => {
        if (tax.isSalesTax) {
          salesTaxes.push(tax.clone());
        } else {
          nonSalesTaxes.push(tax.clone());
        }
      });
    });

    // ok get unique tax descriptions
    this.salesTaxes = this.groupAndSumTaxes(salesTaxes);
    this.nonSalesTaxes = this.groupAndSumTaxes(nonSalesTaxes);
    // calculate sums for each unique tax description
    // push it to the corresponding array for ui binding!
    console.log(this.salesTaxes);
    console.log(this.nonSalesTaxes);
  }

  public serverCalc() {
    const request: DocumentCalculationRequest = new DocumentCalculationRequest();
    request.currencyCode = this.data.currencyCode;
    request.lines = new Array<PricedLine>();
    this.data.lines.forEach((line) => {
      const newline = new PricedLine();
      newline.discountRate = line.discountRate;
      newline.quantity = line.quantity;
      newline.unitAmount = line.unitAmount;
      newline.taxes = new Array<Tax>();
      line.taxes.forEach((t) => {
        const newtax = new Tax();
        newtax.isSalesTax = t.isSalesTax;
        newtax.rate = t.rate;
        newtax.type = TaxType.UnitRate;
        newtax.code = t.code;
        newtax.inclusive = t.inclusive;
        newline.taxes.push(newtax);
      });
    });

    this.serviceLocator.apiClient.calculate('', request).subscribe((response) => {
      console.log(response.toJSON());
    });
  }

  public init(): Observable<void> {
    if (null == this.data) {
      return this.asObservable();
    }
    if (this.data.recipient == null) {
      this.data.recipient = new Recipient();
    }
    if (this.data.recipient.organisation == null) {
      this.data.recipient.organisation = new Organisation();
    }
    if (this.data.recipient.organisation.address == null) {
      this.data.recipient.organisation.address = new Address();
    }
    if (this.data.recipient.contact == null) {
      this.data.recipient.contact = new Contact();
    }
    if (this.data.recipient.contact.address == null) {
      this.data.recipient.contact.address = new Address();
    }
    if (this.data.lines == null || this.data.lines === undefined) {
      this.data.lines = [];
    }

    this.lines = new Array<DocumentLineViewModel>();
    this.data.lines.forEach((line) => {
      if (line.discountRate == null) {
        line.discountRate = 0;
      }
      if (line.taxes == null) {
        line.taxes = [];
      }
      const newline = new DocumentLineViewModel();
      newline.serviceLocator = this.serviceLocator;
      newline.document = this;
      newline.data = line;
      newline.calcTotals();
      this.lines.push(newline);
    });
    this.calcTotals();
    let currencySubscription = null;
    if ((null != this.data) && (null != this.data.currencyCode)
      && (null != this.serviceLocator) && (null != this.serviceLocator.lookups)) {
      currencySubscription = this.serviceLocator.lookups.getCurrency(this.data.currencyCode);
    }
    return Observable.forkJoin(currencySubscription).map((val1) => {
      this._currency = val1[0] as LookupEntry;
      return;
    });
  }
}

export class DocumentLineViewModel extends ViewModel<DocumentLine> {
  private _document: DocumentViewModel = null;
  private _product: ProductViewModel = null;
  constructor() {
    super();
  }

  public get id() {
    return this.data.id;
  }

  public get productName() {
    if (null == this.data.product) {
      return 'δεν έχει οριστεί προϊόν ή υπηρεσία';
    } else {
      return this.data.product.name;
    }
  }

  productComparer(p1: any, p2: any) {
    if (p1 == null || p2 == null) {
      return false;
    }
    return p1.id === p2.id;
  }


  public get product(): ProductViewModel {
    if (null == this._product && null != this.data.product) {
      const vm = new ProductViewModel();
      vm.serviceLocator = this.serviceLocator;
      vm.basePath = this.basePath;
      vm.data = this.data.product;
      this._product = vm;
    }
    return this._product; // this.data.product;
  }

  public set product(value: ProductViewModel) {
    if (!this.data.product || this.data.product.id !== value.id) {
      console.log('should change taxes !');
      this.data.description = value.name;
      this.data.unitAmount = value.data.unitAmount;
      this.data.taxes = new Array<TaxAmount>();
      if (value.data.taxes) {
        value.data.taxes.forEach((tax) => {
          const newtax = new TaxAmount();
          newtax.rate = tax.rate;
          newtax.amount = tax.rate;
          newtax.type = TaxAmountType.UnitRate;
          newtax.code = tax.code;
          newtax.name = tax.name;
          newtax.inclusive = tax.inclusive;
          newtax.isSalesTax = tax.isSalesTax;
          this.data.taxes.push(newtax);
        });
      }
    }
    this._product = value;
    this.data.product = value.data;
    this.calcTotals();
  }

  public get quantity() {
    return this.data.quantity;
  }
  public set quantity(value: number) {
    this.data.quantity = value;
    this.calcTotals();
  }

  public get unitAmount() {
    return this.data.unitAmount;
  }

  public set unitAmount(value: number) {
    this.data.unitAmount = value;
    this.calcTotals();
  }

  public get discountRate() {
    return this.round(this.data.discountRate * 100, 2);
  }

  public set discountRate(value: number) {
    this.data.discountRate = value / 100;
    this.calcTotals();
  }

  public get subTotal() {
    return this.data.subTotal;
  }

  public get totalTax() {
    return this.data.totalTax;
  }

  public get totalSalesTax() {
    return this.data.totalSalesTax;
  }

  public get total() {
    return this.data.total;
  }

  public get taxes() {
    return this.data.taxes;
  }

  public get salesTaxes() {
    return this.taxes ? this.taxes.filter(t => t.isSalesTax) : new Array<TaxAmount>();
  }

  public get salesTaxesLabel() {
    let label = 'δεν έχουν οριστεί φόροι';
    const labelArr = new Array<string>();
    if (this.salesTaxes && this.salesTaxes.length) {
      this.salesTaxes.forEach((tax) => {
        labelArr.push(`${tax.name} (${tax.rate * 100}%)`);
      });
      label = labelArr.join(', ');
    }
    return label;
  }

  public get hasNonSalesTaxes() {
    return this.nonSalesTaxes && this.nonSalesTaxes.length > 0;
  }
  public get nonSalesTaxes() {
    return this.taxes ? this.taxes.filter(t => !t.isSalesTax) : new Array<TaxAmount>();
  }

  public get nonSalesTaxesLabel() {
    let label = 'δεν έχουν οριστεί παρακρατήσεις ή εισφορές';
    const labelArr = new Array<string>();
    if (this.nonSalesTaxes && this.nonSalesTaxes.length) {
      this.nonSalesTaxes.forEach((tax) => {
        labelArr.push(`${tax.name} (${tax.rate * 100}%)`);
      });
      label = labelArr.join(', ');
    }
    return label;
  }

  public get document(): DocumentViewModel {
    return this._document;
  }
  public set document(value: DocumentViewModel) {
    this._document = value;
  }

  public removeTax(tax) {
    alert('remove tax');
  }

  public addTax(event) {
    alert('add tax');
  }

  public calcTotals() {
    this.data.subTotal = (this.quantity * this.unitAmount) - (this.quantity * this.unitAmount * this.data.discountRate);
    this.data.totalSalesTax = 0;
    this.data.totalTax = 0;
    this.data.total = 0;
    if (null != this.taxes) {
      this.taxes.forEach((tax) => {
        tax.amount = tax.rate * this.subTotal;
        if (tax.isSalesTax) {
          this.data.totalSalesTax = this.totalSalesTax + tax.amount;
        } else {
          this.data.totalTax = this.totalTax + tax.amount;
        }
      });
    }
    this.data.total = this.subTotal + this.totalSalesTax;
    if (null != this.document) {
      this.document.calcTotals();
    }
  }
}
