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
  PricedLine, TaxType, TaxDefinition, TaxDefinitionType, DocumentTypeRecordType,
  RecordType, CreateDocumentTypeRequestRecordType
} from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';
import { LookupsService } from '../services/lookups.service';
import { FormControl } from '@angular/forms';
import { retry } from 'rxjs/operator/retry';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { forEach } from '@angular/router/src/utils/collection';
import { TranslateService } from '@ngx-translate/core';

// what you need the service locator will provide...
@Injectable()
export class ServiceLocator {
  constructor(public apiClient: ApiClient, public lookups: LookupsService,
    public sanitizer: DomSanitizer, public translations: TranslateService) {
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

  public get translations(): TranslateService {
    return this.serviceLocator.translations;
  }

  private _data: T = null;
  public get data(): T {
    return this._data;
  }

  public set data(value: T) {
    this._data = value;
    this.dataChanged(value);
  }

  protected dataChanged(data: T) {
    console.log('dataChanged for ' + this.getClassName());
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
  private _products: ProductViewModel[];
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

  public get products(): Observable<Array<ProductViewModel>> {
    if (null == this._products) {
      return this.loadProducts();
    }
    return this.asObservable(this._products);
  }

  getProduct(id): Observable<ProductViewModel> {
    return this.asObservable(this._products.find(item => item.id === id));
  }

  addProduct() {
    const product = new ProductViewModel();
    const data = new Product();
    data.taxes = new Array<Tax>();
    product.basePath = this.basePath;
    product.serviceLocator = this.serviceLocator;
    product.data = data;
    this._products.push(product);
  }

  loadProducts(): Observable<Array<ProductViewModel>> {
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
      this._taxes = result.items.map((tax) => {
        const vm = new TaxDefinitionViewModel();
        vm.basePath = this.basePath;
        vm.serviceLocator = this.serviceLocator;
        vm.data = tax;
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

  public getTaxType() {
    switch (this.data.type) {
      case TaxDefinitionType.Fixed:
        return TaxType.Fixed;
      case TaxDefinitionType.FixedRate:
        return TaxType.FixedRate;
      case TaxDefinitionType.UnitRate:
        return TaxType.UnitRate;
    }
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
  private _salesTaxes: Array<TaxAmount>;
  private _nonSalesTaxes: Array<TaxAmount>;
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

  public get salesTaxes(): TaxAmount[] {
    return this._salesTaxes;
  }
  public set salesTaxes(value: TaxAmount[]) {
    this._salesTaxes = value;
  }

  public get nonSalesTaxes(): TaxAmount[] {
    return this._nonSalesTaxes;
  }
  public set nonSalesTaxes(value: TaxAmount[]) {
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
          salesTaxes.push(tax);
        } else {
          nonSalesTaxes.push(tax);
        }
      });
    });

    // ok get unique tax descriptions
    this.salesTaxes = this.groupAndSumTaxes(salesTaxes);
    this.nonSalesTaxes = this.groupAndSumTaxes(nonSalesTaxes);
  }

  protected dataChanged(data) {
    super.dataChanged(data);
    const status_key = `document.status.${data.status}`;
    this.translations
      .get(status_key)
      .subscribe(translation => {
        this._statusText = translation;
      }, (error) => {
        console.log(status_key + ' not found in translations');
      });

    if (data.recipient == null) {
      data.recipient = new Recipient();
    }
    if (data.recipient.organisation == null) {
      data.recipient.organisation = new Organisation();
    }
    if (data.recipient.organisation.address == null) {
      data.recipient.organisation.address = new Address();
    }
    if (data.recipient.contact == null) {
      this.data.recipient.contact = new Contact();
    }
    if (data.recipient.contact.address == null) {
      this.data.recipient.contact.address = new Address();
    }
    if (data.lines == null || this.data.lines === undefined) {
      this.data.lines = [];
    }

    this.lines = new Array<DocumentLineViewModel>();
    data.lines.forEach((line) => {
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
  }

  public init(): Observable<void> {
    if (null == this.data) {
      return this.asObservable();
    }
    let currencySub = null;
    if (this.data.currencyCode) {
      currencySub = this.serviceLocator.lookups.getCurrency(this.data.currencyCode);
    }
    return Observable.forkJoin(currencySub).map((results) => {
      this._currency = results[0] as LookupEntry;
      return;
    });
  }
}

export class DocumentLineViewModel extends ViewModel<DocumentLine> {
  private _document: DocumentViewModel = null;
  private _product: ProductViewModel = null;
  private _taxes: Array<TaxAmount> = null;
  public salesTaxesControl: FormControl = new FormControl();
  public nonSalesTaxesControl: FormControl = new FormControl();

  constructor() {
    super();
    this.salesTaxesControl.valueChanges.subscribe((selectedTaxes: Array<TaxDefinitionViewModel>) => {
      this.clearSalesTaxes();
      if (null != selectedTaxes && selectedTaxes.length > 0) {
        selectedTaxes.forEach((tax) => {
          const taxdata = new TaxAmount();
          taxdata.init(tax);
          this.taxes.push(taxdata);
        });
      }
      this.calcTotals();
    });

    this.nonSalesTaxesControl.valueChanges.subscribe((selectedTaxes: Array<TaxDefinitionViewModel>) => {
      this.clearNonSalesTaxes();
      if (null != selectedTaxes && selectedTaxes.length > 0) {
        selectedTaxes.forEach((tax) => {
          const taxdata = new TaxAmount();
          taxdata.init(tax);
          this.taxes.push(taxdata);
        });
      }
      this.calcTotals();
    });
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

  taxComparer(p1: any, p2: any) {
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

  public set product(product: ProductViewModel) {
    if (!this.data.product || this.data.product.id !== product.id) {
      console.log('should change taxes !');
      this.data.description = product.name;
      this.data.unitAmount = product.data.unitAmount;
      this.taxes = new Array<TaxAmount>();
      if (product.data.taxes) {
        product.data.taxes.forEach((tax) => {
          const taxdata = new TaxAmount();
          taxdata.init(tax);
          this.taxes.push(taxdata);
        });
      }
    }
    this._product = product;
    this.data.product = product.data;
    this.calcTotals();
  }

  public get quantity() {
    return this.data.quantity ? this.data.quantity : 0;
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

  public get taxes(): Array<TaxAmount> {
    return this.data.taxes;
  }

  public set taxes(value: Array<TaxAmount>) {
    this.data.taxes = value;
  }

  public get salesTaxes() {
    return this.taxes ? this.taxes.filter(t => t.isSalesTax) : new Array<TaxAmount>();
  }

  public get nonSalesTaxes() {
    return this.taxes ? this.taxes.filter(t => !t.isSalesTax) : new Array<TaxAmount>();
  }

  private clearSalesTaxes() {
    // clear all sales taxes!
    const remove = this.taxes.filter(t => t.isSalesTax);
    remove.forEach((t => {
      const i = this.taxes.findIndex(t1 => t1.displayName === t.displayName);
      if (i >= 0) {
        this.taxes.splice(i, 1);
      }
    }));
  }

  private clearNonSalesTaxes() {
    // clear all sales taxes!
    const remove = this.taxes.filter(t => !t.isSalesTax);
    remove.forEach((t => {
      const i = this.taxes.findIndex(t1 => t1.displayName === t.displayName);
      if (i >= 0) {
        this.taxes.splice(i, 1);
      }
    }));
  }

  public get document(): DocumentViewModel {
    return this._document;
  }
  public set document(value: DocumentViewModel) {
    this._document = value;
  }

  public calcTotals() {
    this.data.subTotal = (this.quantity * this.unitAmount) - (this.quantity * this.unitAmount * this.data.discountRate);
    this.data.totalSalesTax = 0;
    this.data.totalTax = 0;
    this.data.total = 0;
    if (null != this.taxes) {
      this.taxes.forEach((tax) => {
        tax.amount = tax.rate * this.data.subTotal;
        if (tax.isSalesTax) {
          this.data.totalSalesTax = this.data.totalSalesTax + tax.amount;
        } else {
          this.data.totalTax = this.data.totalTax + tax.amount;
        }
      });
    }
    this.data.total = this.data.subTotal + this.data.totalSalesTax;
    if (null != this.document) {
      this.document.calcTotals();
    }
  }
}
