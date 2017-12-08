import { Injectable } from '@angular/core';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product, RecordType, Country } from './incontrl-apiclient';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LookupsService {
  private _countries: LookupEntry[] = null;
  private _currencies: LookupEntry[] = null;
  private _timezones: LookupEntry[] = null;
  private _recordTypes: LookupEntry[] = null;
  private readonly maxcount = 10000;

  constructor(private apiClient: ApiClient) {
    this._recordTypes = this.loadRecordTypes();
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

  private loadCountries(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('countries', 1, this.maxcount).map((response) => {
      this._countries = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  getCountry(id) {
    return Observable.create((observer) => {
      observer.next(this._countries.find(country => country.id === id));
      observer.complete();
    });
  }

  public get recordTypes(): Observable<LookupEntry> {
    return Observable.create((observer) => {
      observer.next(this._recordTypes);
      observer.complete();
    });
  }

  private loadRecordTypes(): LookupEntry[] {
    const types: any[] = [];
    // receivables
    const accRec = new LookupEntry();
    accRec.id = 'AccountsReceivable';
    accRec.description = 'Έσοδα';
    types.push(accRec);
    // payables
    const accPay = new LookupEntry();
    accPay.id = 'AccountsPayable';
    accPay.description = 'Έξοδα';
    types.push(accPay);
    return types;
  }

  getRecordType(id) {
    return Observable.create((observer) => {
      observer.next(this._recordTypes.find(r => r.id === id));
      observer.complete();
    });
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

  private loadCurrencies(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('currencies', 1, this.maxcount).map((response) => {
      this._countries = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  getCurrency(id): Observable<LookupEntry> {
    return this.currencies.map((s) => {
      return s.find(currency => currency.id === id);
    });
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

  private loadTimezones(): Observable<LookupEntry[]> {
    const observable = this.apiClient.getLookup('timezones', 1, this.maxcount).map((response) => {
      this._timezones = response.items.map((item) => {
        return item;
      });
      return this._countries;
    });
    return observable;
  }

  getTimezone(id): Observable<LookupEntry> {
    // return this.asObservable<LookupEntry>(this._timezones.find(t => t.id === id));
    return Observable.create((observer) => {
      observer.next(this._timezones.find(t => t.id === id));
      observer.complete();
    });
  }

  asObservable<T>(value): Observable<T> {
    return Observable.create((observer) => {
      observer.next(value);
      observer.complete();
    });
  }

}
