import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiClient, UpdateSubscriptionCompanyRequest } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectImageDialogComponent } from '../../../common/dialogs/select-image-dialog/select-image-dialog.component';
import { AlertsService } from '@jaspero/ng2-alerts';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['../forms.components.scss']
})


export class CompanyFormComponent implements OnInit {
  private _bak: any = null;
  private _model: any = null;
  private readonly = true;
  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set model(value: any) {
    this._model = value;
  }
  get model(): any { return this._model; }

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

  save() {
    this.readonly = true;
    const request: UpdateSubscriptionCompanyRequest = new UpdateSubscriptionCompanyRequest();
    request.logoPath = this.model.company.logoPath;
    request.code = this.model.company.code;
    request.currencyCode = this.model.company.currencyCode;
    request.legalName = this.model.company.legalName;
    request.name = this.model.company.name;
    request.lineOfBusiness = this.model.company.lineOfBusiness;
    request.taxCode = this.model.company.taxCode;
    request.taxOffice = this.model.company.taxOffice;
    request.notes = this.model.company.notes;
    request.email = this.model.company.email;
    request.website = this.model.company.website;
    request.address = this.model.company.address;
    this.apiClient.updateSubscriptionCompany(this.model.id, request).subscribe((company) => {
      // create a new backup copy
      this.bak(this.model);
      if (null != this.model_changed) {
        this.model_changed.next(this.model);
      }
    }, (error) => {
      console.log(error);
      alert(error);
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

  constructor(private apiClient: ApiClient, public dialog: MatDialog) {
    this.model = { company: { address: {} }, contact: {} };
  }

  ngOnInit() {
  }

}
