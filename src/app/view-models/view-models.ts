import { NgModule, Injectable, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { ApiClient, Subscription, LookupEntry, DocumentType, Product, Tax, Document } from '../services/incontrl-apiclient';
import { environment } from '../../environments/environment';

export class SubscriptionViewModel {

  constructor(subscription: Subscription, @Inject(ApiClient) private apiClient?: ApiClient) {
    this.apiClient = apiClient;
    this.model = subscription;
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
    return `${environment.api_url}/subscriptions/${this._model.id}/image?size=64`;
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

  getDocumentType(id) {
    return Observable.create((observer) => {
      observer.next(this._document_types.find(doc => doc.id === id));
      observer.complete();
    });
  }

  // todo:rename
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
    const product = new Product();
    // product.taxes = new Tax[0];
    this._products.push({
      model: product
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

}

export class DocumentTypeViewModel {
  constructor(documentType: DocumentType, private homePath: string) {
    this.model = documentType;
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

}

export class ItemViewModel {
  constructor(item: Product, private homePath: string) {
    this.model = item;
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

  private _model: Product = null;
  public get model(): Product {
    return this._model;
  }

  public set model(value: Product) {
    this._model = value;
  }

}

export class DocumentViewModel {
  constructor(item: Document, public documentType: DocumentTypeViewModel, private homePath: string) {
    this.model = item;
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

  private _model: Document = null;
  public get model(): Document {
    return this._model;
  }

  public set model(value: Document) {
    this._model = value;
  }

}
