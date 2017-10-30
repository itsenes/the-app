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
    // const i = Injector.create([{provide: SubscriptionViewModel, useClass: SubscriptionViewModel, deps: [ApiClient]}]);
    // const vm = i.get(SubscriptionViewModel);
    // return vm;
    // const injector = Injector.create([
    //     { provide: SubscriptionViewModel, deps: [ApiClient] },
    //     { provide: ApiClient, deps: [] }
    //   ]);
    // const subVM = injector.get(SubscriptionViewModel);
    // // const subscriptionVMInjector = ReflectiveInjector.resolveAndCreate([{ provide: SubscriptionViewModel, useClass: SubscriptionViewModel, deps: [ApiClient]}]);
    // // const subVM = subscriptionVMInjector.get(SubscriptionViewModel);
    // // subVM.model = subscription;
    // return subVM;
    return new SubscriptionViewModel(subscription, this.apiClient)
  }
}

// @Injectable()
export class SubscriptionViewModel {
  public busy = false;
  public id = null;
  public alias = null;
  public code = null;
  public status = null;
  public contact = null;
  public company = null;
  public company_logo = null;
  public notes = null;
  public home_path = null;
  public settings_path = null;

  private _model: Subscription = null;
  public get model(): Subscription {
    return this._model;
  }

  public set model(value: Subscription) {
    this._model = value;
    this.id = this._model.id;
    this.alias = this._model.alias;
    this.code = this._model.code;
    this.status = this._model.status;
    this.contact = this._model.contact;
    this.company = this._model.company;
    this.company_logo = environment.api_url + '/subscriptions/' + this._model.id + '/image';
    this.notes = this._model.notes;
    this.home_path = '/app/' + this._model.alias;
    this.settings_path = '/app/' + this._model.alias + '/settings';
  }

  private _document_types: Observable<any>;
  public get document_types(): Observable<any> {
    if (null == this._document_types) {
      this._document_types = this.loadDocumentTypes();
    }
    return this._document_types;
  }

  loadDocumentTypes(): Observable<any> {
    const observable = this.apiClient.getInvoiceTypes(this.id)
      .map((response) => {
        const types = response.items.
          map((doc) => {
            return {
              id: doc.id, name: doc.name,
              notes: doc.notes,
              count: '?',
              search_path: this.home_path + '/documents/' + doc.id,
              addnew_path: this.home_path + '/documents/new',
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



