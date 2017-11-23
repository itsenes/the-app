import { NgModule, Injectable, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product, Tax, Document, Plan } from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';
import { LookupsService } from '../services/lookups.service';
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

  public get company() {
    return this.model.company;
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
    return Observable.create((observer) => {
      observer.next(this._documentTypes.find(doc => doc.id === id));
      observer.complete();
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
    return this.serviceLocator.apiClient.getDocumentTypes(this.id)
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
    return this.serviceLocator.apiClient.getProducts(this.id)
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

  public get Plan(): Observable<Plan> {
    if (null == this._plan) {
      return this.loadPlan();
    } else {
      return Observable.create((observer) => {
        observer.next(this._products);
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
    return `${this.basePath}/documents/${this.documentType.id}/${this.model.id}`;
  }

  public get addNewPath() {
    return `${this.basePath}/documents/new`;
  }
}
