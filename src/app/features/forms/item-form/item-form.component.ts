import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, Product, Tax, TaxType, TaxDefinition } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { ProductViewModel, TaxDefinitionViewModel } from '../../../view-models/view-models';
@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class ItemFormComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  subscription_id: any = null;
  private _bak: any = null;
  private _model: ProductViewModel = null;
  private _currencyCode: string = null;
  public readonly = true;
  private busy = false;
  public taxes = [];
  params_sub: any = null;
  api_path = environment.api_url + '/api/';
  private template_file_url;
  public newtax = new Tax();
  selectedTax: TaxDefinitionViewModel = null;

  @Output() onChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set currencyCode(value: string) {
    this._currencyCode = value;
  }
  public get currencyCode(): string { return this._currencyCode; }

  @Input()
  public set model(value: ProductViewModel) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): ProductViewModel { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient) {
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((sub) => {
          this.subscription_id = sub.id;
          sub.taxes.subscribe((result) => {
            this.taxes = result;
          });
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  toggle_edit_mode() {
    this.readonly = !this.readonly;
    if (!this.readonly) {
      this.bak();
    }
  }

  private bak() {
    this._bak = this.model.data.clone();
  }

  cancel() {
    if (this.isnew()) {
      this.delete();
    } else {
      this.readonly = true;
      this.model.data = this._bak;
    }
  }

  delete() {
    if (null != this.onDelete) {
      this.onDelete.next(this.model);
    }
  }

  isnew() {
    return (null == this.model || this.model.id == null);
  }

  addtax() {
    if (null == this.model.data.taxes) {
      this.model.data.taxes = [];
    }
    const newtax = new Tax();
    newtax.init(this.selectedTax.data);
    this.model.data.taxes.push(newtax);
    this.selectedTax = null;
  }

  removetax(index) {
    this.model.data.taxes.splice(index, 1);
  }

  save() {
    this.readonly = true;

    if (this.isnew()) {
      this.savenew();
      return;
    }

    this.apiClient.updateProduct(this.subscription_id, this.model.id, this.model.data).subscribe((product) => {
      // create a new backup copy
      this.model.data = product;
      this.bak();
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

  savenew() {
    this.apiClient.createProduct(this.subscription_id, this.model.data).subscribe((product) => {
      // create a new backup copy
      this.model.data = product;
      this.bak();
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

}
