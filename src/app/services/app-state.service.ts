import { Component, Injectable, Inject, Injector } from '@angular/core';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product } from './incontrl-apiclient';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
import { SubscriptionViewModel } from '../view-models/view-models';
import { Router } from '@angular/router';
// a simple singleton to maintain app state for now, other patterns e.g. repository could be applied
@Injectable()
export class AppStateService {
  private _subscriptions: SubscriptionViewModel[] = null;
  private _current_subscriptionkey: string = null;
  private _countries: LookupEntry[] = null;
  private _currencies: LookupEntry[] = null;
  private _timezones: LookupEntry[] = null;
  private _lastError = null;

  constructor(private apiClient: ApiClient, private injector: Injector, private router: Router) {
  }

  public onError(error) {
    // implement telemetry
    this._lastError = error;
    this.router.navigate(['/error']);
  }

  public getLastError(): any {
    return this._lastError;
  }

  public clearError() {
    this._lastError = null;
  }

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
