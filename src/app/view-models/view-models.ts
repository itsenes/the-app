import { NgModule, Injectable, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product, Tax, Document } from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';
import { LookupsService } from '../services/lookups.service';
import { _document } from '@angular/platform-browser/src/browser';
// import { AppStateService } from '../services/app-state.service';

@Injectable()
export class ServiceLocator {
  constructor(public apiClient: ApiClient, public lookups: LookupsService) {
  }
}

export abstract class ViewModelBase {
  constructor(serviceLocator: ServiceLocator) {

  }
}
export class ViewModel<T> {
  constructor() {
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
}

@Injectable()
export class ViewModelLocator {
  constructor(private serviceLocator: ServiceLocator) { }

  public getInstance<TViewModel extends ViewModel<T>, T>(type: { new(): TViewModel; }, data: T): TViewModel {
    // const vmType: new () => TViewModel = null;
    const vm = new type();
    vm.model = data;
    vm.serviceLocator = this.serviceLocator;
    return vm;
  }

}

export class SubscriptionViewModel extends ViewModel<Subscription> {

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

  public get company_logo() {
    return `${environment.api_url}/subscriptions/${this.model.id}/image?size=64`;
  }

  public get home_path() {
    return `/app/${this.model.alias}`;
  }

  public get settings_path() {
    return `/app/${this.model.alias}/settings`;
  }

  private _document_types: DocumentTypeViewModel[];
  private _products: any[];

  public get document_types(): Observable<DocumentTypeViewModel[]> {
    if (null == this._document_types) {
      return this.loadDocumentTypes();
    }
    return Observable.create((observer) => {
      observer.next(this._document_types);
      observer.complete();
    });
  }

  getDocumentType(id) {
    return Observable.create((observer) => {
      observer.next(this._document_types.find(doc => doc.id === id));
      observer.complete();
    });
  }

  // todo:rename
  add_document_type() {
    const vm = new DocumentTypeViewModel(null);
    vm.model = new Document();
    vm.serviceLocator = this.serviceLocator;
    this._document_types.push(vm);
  }

  loadDocumentTypes(): Observable<DocumentTypeViewModel[]> {
    return this.serviceLocator.apiClient.getDocumentTypes(this.id)
      .map((response) => {
        if (response.count === 0) {
          this._document_types = DocumentTypeViewModel[0];
        } else {
          this._document_types = response.items.
            map((doc) => {
              const vm = new DocumentTypeViewModel(this.home_path);
              vm.model = doc;
              vm.serviceLocator = this.serviceLocator;
              return vm;
            });
          return this._document_types;
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

  add_product() {
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
                search_path: `${this.home_path}/products/${product.id}`,
                addnew_path: `${this.home_path}/products/new`,
                model: product
              };
            });
        }
        return this._products;
      });
  }

}

export class DocumentTypeViewModel extends ViewModel<DocumentType> {
  constructor(private homePath: string) {
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

  public get icon() {
    return `${environment.api_url}/subscriptions/${this.model.id}/image`;
  }

  public get search_path() {
    return `${this.homePath}/documents/${this.model.id}`;
  }

  public get addnew_path() {
    return `${this.homePath}/documents/new`;
  }
}

export class ItemViewModel extends ViewModel<Product> {
  constructor(item: Product, private homePath: string, protected apiClient: ApiClient) {
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

  public get search_path() {
    return `${this.homePath}/items/${this.model.id}`;
  }

  public get addnew_path() {
    return `${this.homePath}/items/new`;
  }
}

export class DocumentViewModel extends ViewModel<Document> {
  constructor() {
    super();
  }

  public homePath;
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

  public get portal_link() {
    return `${environment.api_url}${this.model.permaLink}`;
  }

  public get doc_link() {
    return `${environment.api_url}${this.model.permaLink}.docx`;
  }

  public get pdf_link() {
    return `${environment.api_url}${this.model.permaLink}.pdf`;
  }

  private _safe_portal_link;
  public get safe_portal_link() {
    return this._safe_portal_link;
  }
  public set safe_portal_link(value) {
    this._safe_portal_link = value;
  }

  public get edit_path() {
    return `${this.homePath}/documents/${this.documentType.id}/${this.model.id}`;
  }

  public get preview_path() {
    return `${this.homePath}/documents/new`;
  }
}
