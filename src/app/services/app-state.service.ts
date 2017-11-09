import { Component, Injectable, Inject, Injector } from '@angular/core';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product } from './incontrl-apiclient';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
// a simple singleton to maintain app state for now, other patterns e.g. repository could be applied
@Injectable()
export class AppStateService {
  private _subscriptions: SubscriptionViewModel[] = null;
  private _current_subscriptionkey: string = null;
  private _countries: LookupEntry[] = null;
  private _currencies: LookupEntry[] = null;
  private _timezones: LookupEntry[] = null;

  public get current_subscriptionkey(): string {
    return this._current_subscriptionkey;
  }

  public get countries(): Observable<LookupEntry[]> {
    if (null === this._countries) {
      return this.loadCountries();
    } else {
      return Observable.create((observer) => {
        observer.next(this._countries);
        observer.complete();
      });
    }
  }

  loadCountries(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('countries').map((response) => {
      this._countries = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  public get currencies(): Observable<LookupEntry[]> {
    if (null === this._currencies) {
      return this.loadCurrencies();
    } else {
      return Observable.create((observer) => {
        observer.next(this._currencies);
        observer.complete();
      });
    }
  }

  loadCurrencies(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('currencies').map((response) => {
      this._countries = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  public get timezones(): Observable<LookupEntry[]> {
    if (null === this._timezones) {
      return this.loadTimezones();
    } else {
      return Observable.create((observer) => {
        observer.next(this._timezones);
        observer.complete();
      });
    }
  }

  loadTimezones(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('timezones').map((response) => {
      this._countries = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  public get subscriptions(): Observable<SubscriptionViewModel[]> {
    if (null === this._subscriptions) {
      return this.loadSubscriptions();
    } else {
      return Observable.create((observer) => {
        observer.next(this._subscriptions);
        observer.complete();
      });
    }
  }

  public get current_subscription(): Observable<SubscriptionViewModel> {
    return Observable.create((observer) => {
      observer.next(this._subscriptions.find(sub => sub.alias === this._current_subscriptionkey));
      observer.complete();
    });
  }

  getSubscriptionByKey(key: string): Observable<SubscriptionViewModel> {
    return Observable.create((observer) => {
      observer.next(this._subscriptions.find(sub => sub.alias === key));
      observer.complete();
    });
  }

  selectSubscription(subscription: any): any {
    if (subscription.alias === this._current_subscriptionkey) {
      return subscription;
    }
    this._current_subscriptionkey = subscription.alias;
    return subscription;
  }

  constructor(private apiClient: ApiClient) { }

  loadSubscriptions(): Observable<SubscriptionViewModel[]> {
    const observable = this.apiClient.getSubscriptions().map((response) => {
      this._subscriptions = response.items.map((subscription) => {
        return this.newSubscriptionVM(subscription);
      });
      return this._subscriptions;
    });
    return observable;
  }

  private newSubscriptionVM(subscription: Subscription): SubscriptionViewModel {
    return new SubscriptionViewModel(subscription, this.apiClient);
  }
}

// @Injectable()
export class SubscriptionViewModel {
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
    return `${environment.api_url}/subscriptions/${this._model.id}/image`;
  }

  public get home_path() {
    return `/app/${this._model.alias}`;
  }

  public get settings_path() {
    return `/app/${this._model.alias}/settings`;
  }

  private _model: Subscription = null;
  public get model(): Subscription {
    return this._model;
  }

  public set model(value: Subscription) {
    this._model = value;
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

  add_document_type() {
    this._document_types.push(new DocumentTypeViewModel(new DocumentType(), this.home_path));
  }

  loadDocumentTypes(): Observable<DocumentTypeViewModel[]> {
    return this.apiClient.getDocumentTypes(this.id)
      .map((response) => {
        if (response.count === 0) {
          this._document_types = DocumentTypeViewModel[0];
        } else {
          this._document_types = response.items.
            map((doc) => {
              return new DocumentTypeViewModel(doc, this.home_path);
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

  add_product() {
    this._products.push({
      model: new Product()
    });
  }

  loadProducts(): Observable<any> {
    return this.apiClient.getProducts(this.id)
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

  constructor(subscription: Subscription, private apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.model = subscription;
  }
}

export class DocumentTypeViewModel {
  public get id() {
    return this.model.id;
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
    return `${environment.api_url}/subscriptions/${this._model.id}/image`;
  }

  public get search_path() {
    return `${this.homePath}/documents/${this.model.id}`;
  }

  public get addnew_path() {
    return `${this.homePath}/documents/new`;
  }

  private _model: DocumentType = null;
  public get model(): DocumentType {
    return this._model;
  }

  public set model(value: DocumentType) {
    this._model = value;
  }

  constructor(documentType: DocumentType, private homePath: string) {
    this.model = documentType;
  }
}
