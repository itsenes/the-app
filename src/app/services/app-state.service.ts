import { Component, Injectable, Inject, Injector } from '@angular/core';
import { ApiClient, Subscription } from './incontrl-apiclient';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
// a simple singleton to maintain app state for now, other patterns could be applied
@Injectable()
export class AppStateService {
  private _subscriptions: any = null;
  private _current_subscription: SubscriptionViewModel = null;
  private _current_subscriptionkey: any = null;

  public get current_subscriptionkey(): string {
    return this._current_subscriptionkey;
  }

  public get subscriptions(): Observable<Array<any>> {
    if (null === this._subscriptions) {
      this._subscriptions = this.loadSubscriptions();
      return this._subscriptions;
    } else {
      return this._subscriptions;
    }
  }

  public get current_subscription(): Observable<SubscriptionViewModel> {
    const observable = this.subscriptions.map(subs => subs.find(sub => sub.alias === this._current_subscriptionkey));
    return observable;
  }

  getSubscriptionByKey(key: string): Observable<SubscriptionViewModel> {
    const observable = this.subscriptions.map(subs => subs.find(sub => sub.alias === key));
    return observable;
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

  loadSubscriptions(): Observable<any> {
    const observable = this.apiClient.getSubscriptions().map((response) => {
      const subscriptions = response.items.map((subscription) => {
        return this.newSubscriptionVM(subscription);
      });
      return subscriptions;
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
  public get alias(){
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

  private _company_logo;
  public get company_logo() {
    return this._company_logo;
  }

  private _home_path;
  public get home_path() {
    return this._home_path;
  }

  private _settings_path;
  public get settings_path() {
    return this._settings_path;
  }

  private _model: Subscription = null;
  public get model(): Subscription {
    return this._model;
  }

  public set model(value: Subscription) {
    this._model = value;
    this._company_logo = environment.api_url + '/subscriptions/' + this._model.id + '/image';
    this._home_path = '/app/' + this._model.alias;
    this._settings_path = '/app/' + this._model.alias + '/settings';
  }

  private _document_types: Observable<any>;
  public get document_types(): Observable<any> {
    if (null == this._document_types) {
      this._document_types = this.loadDocumentTypes();
    }
    return this._document_types;
  }

  loadDocumentTypes(): Observable<any> {
    const observable = this.apiClient.getDocumentTypes(this.id)
      .map((response) => {
        const types = response.items.
          map((doc) => {
            return {
              id: doc.id, name: doc.name,
              notes: doc.notes,
              count: '?',
              search_path: this.home_path + '/documents/' + doc.id,
              addnew_path: this.home_path + '/documents/new',
              model: doc
            };
          });
        return types;
      });
    return observable;
  }

  constructor(subscription: any, private apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.model = subscription;
  }
}



