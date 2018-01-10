import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, Product, Tax, TaxType, TaxDefinition } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { TaxDefinitionViewModel } from '../../../view-models/view-models';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class TaxFormComponent implements OnInit, OnDestroy {
  subscriptionId: any = null;
  private _bak: any = null;
  private _model: TaxDefinitionViewModel = null;
  public readonly = true;
  private busy = false;
  params_sub: any = null;
  api_path = environment.api_url + '/api/';
  private template_file_url;
  public newtax = new Tax();

  @Output() onChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: TaxDefinitionViewModel) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): TaxDefinitionViewModel { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient) {
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      const subscriptionKey = params['subscription-alias'];
      this.appState.getSubscriptionByKey(subscriptionKey)
        .subscribe((sub) => {
          this.subscriptionId = sub.id;
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  toggle_edit_mode() {
    this.readonly = !this.readonly;
    if (!this.readonly) {
      this.bak(this.model.data);
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

  save() {
    this.model.isSalesTax = this.model.code === 'VAT';
    this.readonly = true;

    if (this.isnew()) {
      this.savenew();
      return;
    }

    this.apiClient.updateTax(this.subscriptionId, this.model.id, this.model.data).subscribe((tax) => {
      // create a new backup copy
      this.bak(this.model.data);
      this.model.data = tax;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

  savenew() {
    this.apiClient.createTax(this.subscriptionId, this.model.data).subscribe((tax) => {
      // create a new backup copy
      this.bak(this.model);
      this.model.data = tax;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }
}
