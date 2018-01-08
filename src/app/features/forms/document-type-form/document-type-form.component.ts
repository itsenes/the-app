import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import {
  ApiClient, DocumentType,
  UpdateDocumentTypeRequest,
  CreateDocumentTypeRequest,
  CreateDocumentTypeRequestRecordType,
  LookupEntry, FileParameter
} from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectImageDialogComponent } from '../../../common/dialogs/select-image-dialog/select-image-dialog.component';
import { environment } from '../../../../environments/environment';
import { LookupsService } from '../../../services/lookups.service';
import { DocumentTypeViewModel } from '../../../view-models/view-models';

@Component({
  selector: 'app-document-type-form',
  templateUrl: './document-type-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class DocumentTypeFormComponent implements OnInit, OnDestroy {
  subscriptionKey: any = null;
  subscriptionId: any = null;
  private _bak: any = null;
  private _model: DocumentTypeViewModel = null;
  public readonly = true;
  private busy = false;
  public currencies = [];
  public countries = [];
  params_sub: any = null;
  api_path = environment.api_url + '/api/';
  private template_file_url;
  public tempfile: any = null;

  @Output() onChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: DocumentTypeViewModel) {
    this._model = value;
    if (value != null) {
      this.readonly = (value.id != null);
    }
  }
  public get model(): DocumentTypeViewModel { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient, private lookups: LookupsService) {
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscriptionKey = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscriptionKey)
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

  upload_file(event) {
    if (event && event.returnValue && event.target && event.target.files && event.target.files.length > 0) {
      const fileParam = <FileParameter>{};
      const reader = new FileReader();
      const file = event.target.files[0];
      fileParam.fileName = file.name;
      reader.readAsDataURL(file);
      reader.onload = (evt) => {
        fileParam.data = (<FileReader>evt.target).result;
        this.apiClient.updateDocumentTypeTemplate(this.subscriptionId, this.model.id, fileParam).subscribe(() => {
          this.tempfile = null;
          this.alertsService.create('success', 'Η αποστολή του αρχείου έγινε με επιτυχία!');
        }, (error) => {
          this.tempfile = null;
          this.alertsService.create('error', 'Σφάλμα κατα την αποστολή του αρχείου! Μύνημα συστήματος: ' + error);
        });
      };
    }
  }

  download_file(event) {
    const target = event.currentTarget;
    if (null != this.template_file_url) {
      return;
    }
    const file_type = this.model.data.template.contentType;
    this.apiClient.getDocumentTypeTemplate(this.subscriptionId, this.model.id)
      .subscribe((response) => {
        const blob: Blob = new Blob([response.data], {
          type: `"${this.model.data.template.contentType}"`
        });
        this.template_file_url = window.URL.createObjectURL(blob);
        target.href = this.template_file_url;
        target.click();
      });
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
    request.code = this.model.data.code;
    request.culture = this.model.data.culture;
    request.generatesPrintouts = this.model.data.generatesPrintouts;
    request.name = this.model.name;
    request.notes = this.model.notes;
    request.numberFormat = this.model.data.numberFormat;
    request.numberOffset = this.model.data.numberOffset;
    request.tags = this.model.data.tags;
    request.uiHint = this.model.data.uiHint;
    this.apiClient.updateDocumentType(this.subscriptionId, this.model.id, request).subscribe((documentType) => {
      // create a new backup copy
      this.bak();
      this.model.data = documentType;
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
    request.code = this.model.data.code;
    request.culture = this.model.data.culture;
    request.generatesPrintouts = this.model.data.generatesPrintouts;
    request.name = this.model.name;
    request.notes = this.model.notes;
    request.numberFormat = this.model.data.numberFormat;
    request.numberOffset = this.model.data.numberOffset;
    request.recordType = this.model.getCreateRecordType();
    request.tags = this.model.data.tags;
    request.uiHint = this.model.data.uiHint;
    this.apiClient.createDocumentType(this.subscriptionId, request).subscribe((documentType) => {
      // create a new backup copy
      this.bak();
      this.model.data = documentType;
      this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
    }, (error) => {
      this.readonly = false; // continue editing
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
    });
  }
}
