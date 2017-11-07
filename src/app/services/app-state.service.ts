import { Component, Injectable, Inject, Injector } from '@angular/core';
import { ApiClient, Subscription, LookupEntry, DocumentType } from './incontrl-apiclient';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
// a simple singleton to maintain app state for now, other patterns could be applied
@Injectable()
export class AppStateService {
  private _subscriptions: SubscriptionViewModel[] = null;
  private _current_subscription: SubscriptionViewModel = null;
  private _current_subscriptionkey: any = null;
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

  public get currencies(): Observable<any[]> {
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

  public get timezones(): Observable<any[]> {
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
    this._current_subscription = subscription;
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
  public busy = false;
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

  private _settings_path;
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

  private _document_types: any[];
  public get document_types(): Observable<any[]> {
    if (null == this._document_types) {
      return this.loadDocumentTypes();
    }
    return Observable.create((observer) => {
      observer.next(this._document_types);
      observer.complete();
    });
  }

  add_document_type() {
    this._document_types.push({
      model: new DocumentType()
    });
  }

  loadDocumentTypes(): Observable<any> {
    const observable = this.apiClient.getDocumentTypes(this.id)
      .map((response) => {
        this._document_types = response.items.
          map((doc) => {
            return {
              id: doc.id, name: doc.name,
              notes: doc.notes,
              count: '?',
              search_path: `${this.home_path}/documents/${doc.id}`,
              addnew_path: `${this.home_path}/documents/new`,
              model: doc
            };
          });
        return this._document_types;
      });
    return observable;
  }

  constructor(subscription: Subscription, private apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.model = subscription;
  }
}



