import { Component, Injectable, Inject, Injector } from '@angular/core';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product, RecordType } from './incontrl-apiclient';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
import { ViewModelLocator, SubscriptionViewModel } from '../view-models/view-models';
import { Router } from '@angular/router';
// a simple singleton to maintain app state for now, other patterns e.g. repository could be applied
@Injectable()
export class AppStateService {
  private _subscriptions: SubscriptionViewModel[] = null;
  private _current_subscriptionkey: string = null;
  private _lastError = null;


  constructor(private apiClient: ApiClient, private injector: Injector,
    private router: Router, private viewModelLocator: ViewModelLocator) {
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

  public getSubscriptionByKey(key: string): Observable<SubscriptionViewModel> {
    return Observable.create((observer) => {
      observer.next(this._subscriptions.find(sub => sub.alias === key));
      observer.complete();
    });
  }

  public selectSubscription(subscription: SubscriptionViewModel): SubscriptionViewModel {
    if (subscription.alias !== this._current_subscriptionkey) {
      this.viewModelLocator.basePath = subscription.homePath;
      if (subscription.alias === this._current_subscriptionkey) {
        return subscription;
      }
      this._current_subscriptionkey = subscription.alias;
    }
    return subscription;
  }

  private loadSubscriptions(): Observable<SubscriptionViewModel[]> {
    const observable = this.apiClient.getSubscriptions().map((response) => {
      this._subscriptions = response.items.map((subscription) => {
        const vm = this.viewModelLocator.getInstance<SubscriptionViewModel, Subscription>(SubscriptionViewModel, subscription);
        return vm;
      });
      return this._subscriptions;
    });
    return observable;
  }
}
