import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, UpdateSubscriptionCompanyRequest, UpdateOrganisationRequest } from '../../../services/incontrl-apiclient';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectImageDialogComponent } from '../../../common/dialogs/select-image-dialog/select-image-dialog.component';
import { LookupsService } from '../../../services/lookups.service';
import { SubscriptionViewModel } from '../../../view-models/view-models';

@Component({
  selector: 'app-subscription-company',
  templateUrl: './subscription-company.component.html',
  styleUrls: ['../forms.components.scss']
})


export class SubscriptionCompanyComponent implements OnInit, OnDestroy {
  subscription: SubscriptionViewModel = null;
  subscription_key: any = null;
  private _bak: any = null;
  private _model: any = null;
  public _readonly = true;
  private busy = false;
  public currencies = [];
  public countries = [];
  params_sub: any = null;
  _title: string = null;
  private manageEdit = false;

  @Output() model_changed: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public set title(value: any) {
    this._title = value;
  }
  public get title(): any { return this._title; }

  @Input()
  public set model(value: any) {
    this._model = value;
  }
  public get model(): any { return this._model; }

  @Input()
  public set readonly(value: any) {
    this._readonly = value;
  }
  public get readonly(): any { return this._readonly; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    public dialog: MatDialog, private appState: AppStateService,
    private apiClient: ApiClient, private lookups: LookupsService) {
    this.model = { company: { address: {} }, contact: {} };
  }

  ngOnInit() {
    this.lookups.currencies.subscribe((currencies) => {
      this.currencies = currencies;
    });
    this.lookups.countries.subscribe((countries) => {
      this.countries = countries;
    });
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((sub) => {
          this.subscription = sub;
          if (null == this.model || null == this.model.id) {
            this.model = sub.model.company;
          }
          if (!this.readonly) {
            this.bak(this.model);
          }
        });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

  toggle_edit_mode() {
    this.manageEdit = true;
    this.readonly = !this.readonly;
    if (!this.readonly) {
      this.bak(this.model);
    }
  }

  private bak(value: any) {
    this._bak = value.clone();
  }

  cancel() {
    if (this.manageEdit) {
      this.readonly = true;
    }
    this.model = this._bak;
  }

  save() {
    this.readonly = true;
    // UpdateOrganisationRequest
    const request: UpdateOrganisationRequest = new UpdateOrganisationRequest();
    request.logoPath = this.model.logoPath;
    request.code = this.model.code;
    request.currencyCode = this.model.currencyCode;
    request.legalName = this.model.legalName;
    request.name = this.model.name;
    request.lineOfBusiness = this.model.lineOfBusiness;
    request.taxCode = this.model.taxCode;
    request.taxOffice = this.model.taxOffice;
    request.notes = this.model.notes;
    request.email = this.model.email;
    request.website = this.model.website;
    request.address = this.model.address;
    this.apiClient.updateOrganisation(this.subscription.id, this.model.id, request).subscribe((company) => {
      // create a new backup copy
      this.bak(this.model);
      this.model = company;
      this.appState.getSubscriptionByKey(this.subscription_key).subscribe((sub) => {
        if (sub.model.company.id === this.model.id) {
          sub.model.company = this.model.clone();
        }
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
        imagePath: this.model.logoPath
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result != null) {
        this.model.logoPath = result;
      }
    });
  }
}
