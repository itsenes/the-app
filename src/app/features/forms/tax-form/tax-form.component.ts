import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, Product, Tax, TaxType, TaxDefinition } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class TaxFormComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  subscription_id: any = null;
  private _bak: any = null;
  private _model: TaxDefinition = null;
  public readonly = true;
  private busy = false;
  params_sub: any = null;
  api_path = environment.api_url + '/api/';
  private template_file_url;
  public newtax = new Tax();

  @Output() onChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: TaxDefinition) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): TaxDefinition { return this._model; }

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
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  getTaxType(type) {
    switch (type) {
      case 'VAT': {
        return 'Φόρος προστιθέμενης αξίας πώλησης αγαθών ή παροχής υπηρεσιών (ΦΠΑ)';
      }
      case 'DEDUCTABLE': {
        return 'Κρατήσεις, παρακρατήσεις, εισφορές, χαρτόσημα, κτλ';
      }
      default: {
        return 'Άλλος τύπος φόρου';
      }
    }
  }

  toggle_edit_mode() {
    this.readonly = !this.readonly;
    if (!this.readonly) {
      this.bak(this.model);
    }
  }

  private bak(value: any) {
    this._bak = value.clone();
  }

  cancel() {
    if (this.isnew()) {
      this.delete();
    } else {
      this.readonly = true;
      this.model = this._bak;
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

  save() {
    if (this.isnew()) {
      this.savenew();
      return;
    }

    this.readonly = true;
    this.apiClient.updateTax(this.subscription_id, this.model.id, this.model).subscribe((tax) => {
      // create a new backup copy
      this.bak(this.model);
      this.model = tax;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

  savenew() {
    this.apiClient.createTax(this.subscription_id, this.model).subscribe((tax) => {
      // create a new backup copy
      this.bak(this.model);
      this.model = tax;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }
}
