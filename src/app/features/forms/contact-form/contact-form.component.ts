import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, Contact, Address, UpdateContactRequest } from '../../../services/incontrl-apiclient';


@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class ContactFormComponent implements OnInit, OnDestroy {
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
  public set model(value: Contact) {
    this._model = value;
  }
  public get model(): Contact { return this._model; }

  constructor(private alertsService: AlertsService, private route: ActivatedRoute,
    private appState: AppStateService,
    private apiClient: ApiClient) {
    this.model = new Contact();
    this.model.address = new Address();
  }

  ngOnInit() {
    this.appState.currencies.subscribe((items) => {
      this.currencies = items;
    });
    this.appState.countries.subscribe((items) => {
      this.countries = items;
    });
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((sub) => {
          const contact = sub.model.contact.clone();
          if (null == contact.address) {
            contact.address = new Address();
          }
          this.model = contact;
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

  save() {
    this.readonly = true;
    const request: UpdateContactRequest = new UpdateContactRequest();
    // request.logoPath = this.model.company.logoPath;
    // request.code = this.model.company.code;
    // request.currencyCode = this.model.company.currencyCode;
    // request.legalName = this.model.company.legalName;
    // request.name = this.model.company.name;
    // request.lineOfBusiness = this.model.company.lineOfBusiness;
    // request.taxCode = this.model.company.taxCode;
    // request.taxOffice = this.model.company.taxOffice;
    request.notes = this.model.notes;
    request.email = this.model.email;
    // request.website = this.model.company.website;
    request.address = this.model.address;
    this.apiClient.updateSubscriptionContact(this.model.id, request).subscribe((company) => {
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
}