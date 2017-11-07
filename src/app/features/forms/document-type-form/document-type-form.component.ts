import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, UpdateDocumentTypeRequest, CreateDocumentTypeRequest } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectImageDialogComponent } from '../../../common/dialogs/select-image-dialog/select-image-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-document-type-form',
  templateUrl: './document-type-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class DocumentTypeFormComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  subscription_id: any = null;
  private _bak: any = null;
  private _model: any = null;
  public readonly = true;
  private busy = false;
  public currencies = [];
  public countries = [];
  params_sub: any = null;
  isnew = false;
  api_path = environment.api_url + '/api/';
  private template_file_url;

  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: any) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
      this.isnew = true;
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
    this.readonly = true;
    this.model = this._bak;
  }

  delete() {
    this.apiClient.deleteDocumentType(this.subscription_id, this.model.id)
      .subscribe(() => {
        
      });
  }

  download_file(event) {
    const target = event.currentTarget;
    if (null != this.template_file_url) {
      return;
    }
    const file_type = this.model.template.contentType;
    this.apiClient.getDocumentTypeTemplate(this.subscription_id, this.model.id)
      .subscribe((response) => {
        const blob: Blob = new Blob([response.data], {
          type: `"${this.model.template.contentType}"`
        });
        this.template_file_url = window.URL.createObjectURL(blob);
        target.href = this.template_file_url;
        target.click();
        // event.cancel = true;
      });
  }

  save() {
    if (this.isnew) {
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

  openLogoDialog(): void {
    const dialogRef = this.dialog.open(SelectImageDialogComponent, {
      width: '550px',
      data: {
        imagePath: this.model.company.logoPath
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result != null) {
        this.model.company.logoPath = result;
      }
    });
  }
}
