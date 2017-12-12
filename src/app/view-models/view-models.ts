import { _document } from '@angular/platform-browser/src/browser';
import { NgModule, Injectable, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import {
  ApiClient, Subscription, LookupEntry, DocumentType,
  Product, Tax, Document, Plan, Recipient, Organisation, Contact,
  DocumentLine, Address
} from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';
import { LookupsService } from '../services/lookups.service';
import { MethodCall } from '@angular/compiler';
// causes circular...
// import { AppStateService } from '../services/app-state.service';

// what you need the service locator will provide...
@Injectable()
export class ServiceLocator {
  constructor(public apiClient: ApiClient, public lookups: LookupsService) {
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

  private _model: T = null;
  public get model(): T {
    return this._model;
  }

  public set model(value: T) {
    this._model = value;
  }

  getClassName() {
    const comp: any = this.constructor;
    return comp.name;
  }
}

@Injectable()
export class ViewModelLocator {
  constructor(private serviceLocator: ServiceLocator) { }
  private _basePath: string = null;
  public get basePath() {
    return this._basePath;
  }
  public set basePath(value: string) {
    this._basePath = value;
  }

  public getInstance<TViewModel extends ViewModel<T>, T>(type: { new(): TViewModel; }, data: T): TViewModel {
    // const vmType: new () => TViewModel = null;
    const vm = new type();
    vm.model = data;
    vm.serviceLocator = this.serviceLocator;
    vm.basePath = this.basePath;
    console.log('getinstance -' + vm.getClassName() + ' homepath in resolved vm: ' + vm.basePath);
    return vm;
  }

}

export class SubscriptionViewModel extends ViewModel<Subscription> {
  private _documentTypes: DocumentTypeViewModel[];
  private _products: any[];
  private _plan: Plan;

  constructor() {
    super();
  }

  public get id() {
    return this.model.id;
  }

  public get alias() {
    return this.model.alias;
  }

  public get status() {
    return this.model.status;
  }

  public get contact() {
    return this.model.contact;
  }

  private _company: OrganisationViewModel;
  public get company() {
    if (null == this._company) {
      this._company = new OrganisationViewModel();
      this._company.basePath = this.basePath;
      this._company.model = this.model.company;
      this._company.serviceLocator = this.serviceLocator;
    }
    return this._company;
  }

  public get companyLogo() {
    return `${environment.api_url}/subscriptions/${this.model.id}/image?size=64`;
  }

  public get basePath() {
    return this.homePath;
  }
  // no setter that is...
  public set basePath(value: string) { }

  public get homePath() {
    return `/app/${this.model.alias}`;
  }

  public get settingsPath() {
    return `/app/${this.model.alias}/settings`;
  }

  public get documentTypes(): Observable<DocumentTypeViewModel[]> {
    if (null == this._documentTypes) {
      return this.loadDocumentTypes();
    }
    return Observable.create((observer) => {
      observer.next(this._documentTypes);
      observer.complete();
    });
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
    vm.model = new Document();
    vm.serviceLocator = this.serviceLocator;
    vm.basePath = this.basePath;
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
              vm.model = doc;
              vm.serviceLocator = this.serviceLocator;
              vm.basePath = this.basePath;
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
    return Observable.create((observer) => {
      observer.next(this._products);
      observer.complete();
    });
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
              return {
                id: product.id,
                name: product.name,
                notes: product.notes,
                searchPath: `${this.basePath}/products/${product.id}`,
                addNewPath: `${this.basePath}/products/new`,
                model: product
              };
            });
        }
        return this._products;
      });
  }

  public get plan(): Observable<Plan> {
    if (null == this._plan) {
      return this.loadPlan();
    } else {
      return Observable.create((observer) => {
        observer.next(this._plan);
        observer.complete();
      });
    }
  }

  private loadPlan(): Observable<Plan> {
    return this.serviceLocator.apiClient.getSubscriptionPlan(this.id).map((plan) => {
      this._plan = plan;
      return this._plan;
    });
  }
}

export class OrganisationViewModel extends ViewModel<Organisation> {
  constructor() {
    super();
  }

  public get id() {
    return this.model.id;
  }

  public get logo() {
    if (null == this.model.logoPath) {
      return `${environment.api_url}/subscriptions/${this.model.id}/image?size=64`;
    } else if (this.model.logoPath.indexOf('http') >= 0) {
      return this.model.logoPath;
    } else {
      return `${environment.api_url}/${this.model.logoPath}`;
    }
  }

  private _currency: LookupEntry;
  public get currency(): LookupEntry {
    return this._currency;
  }

  public set currency(value: LookupEntry) {
    this._currency = value;
    this.model.currencyCode = value ? value.id : undefined;
  }

}

export class DocumentTypeViewModel extends ViewModel<DocumentType> {
  constructor() {
    super();
  }

  public get id() {
    return this.model.id;
  }

  public get folder() {
    return this.model.code;
  }

  public get name() {
    return this.model.name;
  }

  public get notes() {
    return this.model.notes;
  }

  public get alias() {
    return this.model.code;
  }

  public get searchPath() {
    return `${this.basePath}/documents/${this.model.id}`;
  }

  public get addNewPath() {
    return `${this.basePath}/documents/${this.model.id}/new`;
  }
}

export class ItemViewModel extends ViewModel<Product> {
  constructor() {
    super();
  }

  public get id() {
    return this.model.id;
  }

  public get folder() {
    return this.model.code;
  }

  public get name() {
    return this.model.name;
  }

  public get notes() {
    return this.model.notes;
  }

  public get searchPath() {
    return `${this.basePath}/items/${this.model.id}`;
  }

  public get addNewPath() {
    return `${this.basePath}/items/new`;
  }
}

export class DocumentViewModel extends ViewModel<Document> {
  constructor() {
    super();
  }

  private _documentType: DocumentTypeViewModel = null;
  public get documentType(): DocumentTypeViewModel {
    return this._documentType;
  }

  public set documentType(value: DocumentTypeViewModel) {
    this._documentType = value;
  }

  public get id() {
    return this.model.id;
  }

  public get displayName() {
    if (null == this.model || null == this.model.id) {
      return 'ΝΕΟ ΠΑΡΑΣΤΑΤΙΚΟ';
    } else if (this.model.numberPrintable == null) {
      return `${this.model.status} ${this.model.date}`;
    } else {
      return this.model.numberPrintable;
    }
  }

  public get folder() {
    return this.documentType.folder;
  }

  private _currency: LookupEntry;
  public get currency(): LookupEntry {
    return this._currency;
  }

  public set currency(value: LookupEntry) {
    this._currency = value;
    this.model.currencyCode = value ? value.id : undefined;
  }

  public get notes() {
    return this.model.notes;
  }

  public get portalLink() {
    return `${environment.api_url}${this.model.permaLink}`;
  }

  public get portalDocLink() {
    return `${environment.api_url}${this.model.permaLink}.docx`;
  }

  public get portalPdfLink() {
    return `${environment.api_url}${this.model.permaLink}.pdf`;
  }

  private _safePortalLink;
  public get safePortalLink() {
    return this._safePortalLink;
  }
  public set safePortalLink(value) {
    this._safePortalLink = value;
  }

  public get editPath() {
    return `${this.basePath}/documents/${this.documentType.id}/${this.model.id}?edit`;
  }

  public get viewPath() {
    return `${this.basePath}/documents/${this.documentType.id}/${this.model.id}`;
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
  }

  public addline(index) {
  }

  public calcTotals() {
    // alert('calc totals callback');
    this.model.subTotal = 0;
    this.model.totalSalesTax = 0;
    this.model.totalTax = 0;
    this.model.total = 0;
    this.model.totalPayable = 0;

    this.lines.forEach((line) => {
      this.model.subTotal = this.model.subTotal + line.subTotal;
      this.model.totalSalesTax = this.model.totalSalesTax + line.totalSalesTax;
      this.model.total = this.model.total + line.total;
      this.model.totalTax = this.model.totalTax + line.totalTax;
      this.model.totalPayable = this.model.totalPayable + (line.total + line.totalTax);
    });
  }

  public init(): Observable<void> {
    if (null == this.model) {
      return Observable.create((observer) => {
        observer.next();
        observer.complete();
      });
    }
    if (this.model.recipient == null) {
      this.model.recipient = new Recipient();
    }
    if (this.model.recipient.organisation == null) {
      this.model.recipient.organisation = new Organisation();
    }
    if (this.model.recipient.organisation.address == null) {
      this.model.recipient.organisation.address = new Address();
    }
    if (this.model.recipient.contact == null) {
      this.model.recipient.contact = new Contact();
    }
    if (this.model.recipient.contact.address == null) {
      this.model.recipient.contact.address = new Address();
    }
    if (this.model.lines == null || this.model.lines === undefined) {
      this.model.lines = [];
    }

    this.lines = new Array<DocumentLineViewModel>();
    this.model.lines.forEach((line) => {
      if (line.discountRate == null) {
        line.discountRate = 0;
      }
      if (line.taxes == null) {
        line.taxes = [];
      }
      const newline = new DocumentLineViewModel();
      newline.model = line;
      newline.serviceLocator = this.serviceLocator;
      newline.document = this;
      this.lines.push(newline);
    });

    let currencySubscription = null;
    if (null != this.model && null != this.model.currencyCode) {
      currencySubscription = this.serviceLocator.lookups.getCurrency(this.model.currencyCode);
    }
    return Observable.forkJoin(currencySubscription).map((val1) => {
      this._currency = val1[0] as LookupEntry;
      return;
    });
  }
}


export class DocumentLineViewModel extends ViewModel<DocumentLine> {
  constructor() {
    super();
  }

  public get id() {
    return this.model.id;
  }

  public get productName() {
    if (null == this.model.product) {
      return 'δεν έχει οριστεί προϊόν ή υπηρεσία';
    } else {
      return this.model.product.name;
    }
  }

  public get quantity() {
    return this.model.quantity;
  }
  public set quantity(value: number) {
    this.model.quantity = value;
    this.calcTotals();
  }

  public get unitAmount() {
    return this.model.unitAmount;
  }

  public set unitAmount(value: number) {
    this.model.unitAmount = value;
    this.calcTotals();
  }

  public get discountRate() {
    return this.model.discountRate * 100;
  }

  public set discountRate(value: number) {
    this.model.discountRate = value / 100;
    this.calcTotals();
  }

  public get subTotal() {
    return this.model.subTotal;
  }
  public set subTotal(value) {
    this.model.subTotal = value;
  }

  public get totalTax() {
    return this.model.totalTax;
  }

  public get totalSalesTax() {
    return this.model.totalSalesTax;
  }

  public get total() {
    return this.model.total;
  }

  public set total(value) {
    this.model.total = value;
  }

  public get taxes() {
    return this.model.taxes;
  }

  private _document: DocumentViewModel = null;
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

  private calcTotals() {
    this.subTotal = (this.quantity * this.unitAmount) - (this.quantity * this.unitAmount * this.model.discountRate);
    this.model.totalSalesTax = 0;
    this.model.totalTax = 0;
    this.model.total = 0;
    if (null != this.taxes) {
      this.taxes.forEach((tax) => {
        tax.amount = tax.rate * this.subTotal;
        if (tax.isSalesTax) {
          this.model.totalSalesTax = this.totalSalesTax + tax.amount;
        } else {
          this.model.totalTax = this.totalTax + tax.amount;
        }
      });
    }
    this.model.total = this.subTotal + this.totalSalesTax;
    if (null != this.document) {
      this.document.calcTotals();
    }
  }

}
