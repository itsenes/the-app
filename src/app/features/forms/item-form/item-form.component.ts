import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, UpdateDocumentTypeRequest, CreateDocumentTypeRequest } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class ItemFormComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  subscription_id: any = null;
  private _bak: any = null;
  private _model: any = null;
  public readonly = true;
  private busy = false;
  public currencies = [];
  public countries = [];
  params_sub: any = null;
  api_path = environment.api_url + '/api/';
  private template_file_url;

  @Output() onChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: any) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): any { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient) {
    this.model = {};
  }

  ngOnInit() {
    // this.appState.currencies.subscribe((items) => {
    //   this.currencies = items;
    // });
    // this.appState.countries.subscribe((items) => {
    //   this.countries = items;
    // });
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
    const request: UpdateDocumentTypeRequest = new UpdateDocumentTypeRequest();
    this.readonly = true;
    request.code = this.model.code;
    request.culture = this.model.culture;
    request.generatesPrintouts = this.model.generatesPrintouts;
    request.name = this.model.name;
    request.notes = this.model.notes;
    request.numberFormat = this.model.numberFormat;
    request.numberOffset = this.model.numberOffset;
    request.recordType = this.model.recordType;
    request.tags = this.model.tags;
    request.uiHint = this.model.uiHint;
    this.apiClient.updateDocumentType(this.subscription_id, this.model.id, request).subscribe((documentType) => {
      // create a new backup copy
      this.bak(this.model);
      this.model = documentType;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

  savenew() {
    const request: CreateDocumentTypeRequest = new CreateDocumentTypeRequest();
    this.readonly = true;
    request.code = this.model.code;
    request.culture = this.model.culture;
    request.generatesPrintouts = this.model.generatesPrintouts;
    request.name = this.model.name;
    request.notes = this.model.notes;
    request.numberFormat = this.model.numberFormat;
    request.numberOffset = this.model.numberOffset;
    request.recordType = this.model.recordType;
    request.tags = this.model.tags;
    request.uiHint = this.model.uiHint;
    this.apiClient.createDocumentType(this.subscription_id, request).subscribe((documentType) => {
      // create a new backup copy
      this.bak(this.model);
      this.model = documentType;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }

}
