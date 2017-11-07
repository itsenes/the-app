import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../services/app-state.service';
import { ApiClient, UpdateSubscriptionCompanyRequest } from '../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectImageDialogComponent } from '../../common/dialogs/select-image-dialog/select-image-dialog.component';


@Component({
  selector: 'app-document-types',
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.scss', '../forms/forms.components.scss']
})
export class DocumentTypesComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  private _bak: any = null;
  private _model: any = null;
  public readonly = true;
  private busy = false;
  public currencies = [];
  public countries = [];
  params_sub: any = null;

  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set model(value: any) {
    this._model = value;
  }
  public get model(): any { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient) {
    this.model = {};
  }

  ngOnInit() {
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((subscription) => {
          this.model = subscription;
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  add_new() {
   this.model.add_document_type();
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
      this.appState.getSubscriptionByKey(this.subscription_key).subscribe((sub) => {
        sub.model = this.model;
        this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
      });
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
}
