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
  private _currentSubscriptionKey: string = null;
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
    return this._currentSubscriptionKey;
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

  public get currentSubscription(): Observable<SubscriptionViewModel> {
    return this.getSubscriptionByKey(this._currentSubscriptionKey);
  }

  public getSubscriptionByKey(key: string): Observable<SubscriptionViewModel> {
    return this.subscriptions.map((s) => {
      return s.find(sub => sub.alias === key);
    });
  }

  public selectSubscription(subscription: SubscriptionViewModel): SubscriptionViewModel {
    if (subscription != null && subscription.alias !== this._currentSubscriptionKey) {
      this.viewModelLocator.basePath = subscription.homePath;
      if (subscription.alias === this._currentSubscriptionKey) {
        return subscription;
      }
      this._currentSubscriptionKey = subscription.alias;
    }
    return subscription;
  }

  private loadSubscriptions(): Observable<SubscriptionViewModel[]> {
    const observable = this.apiClient.getSubscriptions(false, 1, 100).map((response) => {
      this._subscriptions = response.items.map((subscription) => {
        const vm = this.viewModelLocator.getInstance<SubscriptionViewModel, Subscription>(SubscriptionViewModel, subscription);
        return vm;
      });
      return this._subscriptions;
    });
    return observable;
  }
}
