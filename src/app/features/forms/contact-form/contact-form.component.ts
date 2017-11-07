import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '@jaspero/ng2-alerts';
import { AppStateService } from '../../../services/app-state.service';
import { ApiClient, Contact, Address, UpdateContactRequest, LookupEntry } from '../../../services/incontrl-apiclient';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class ContactFormComponent implements OnInit, OnDestroy {
  subscription_key: any = null;
  subscription_id: any = null;
  private _bak: any = null;
  private _model: any = null;
  public readonly = true;
  private busy = false;
  public countries = [];
  params_sub: any = null;
  myControl: FormControl = new FormControl();

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
    this.appState.countries.subscribe((items) => {
      this.countries = items;
    });
    this.params_sub = this.route.parent.params.subscribe((params) => {
      this.subscription_key = params['subscription-alias'];
      this.appState.getSubscriptionByKey(this.subscription_key)
        .subscribe((sub) => {
          this.subscription_id = sub.id;
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

  displayCountryFn(country: LookupEntry): string {
    return country ? country.description : '';
  }


  save() {
    this.readonly = true;
    const request: UpdateContactRequest = new UpdateContactRequest();
    request.firstName = this.model.firstName;
    request.lastName = this.model.lastName;
    request.email = this.model.email;
    request.phone1 = this.model.phone1;
    request.phone2 = this.model.phone2;
    request.skype = this.model.skype;
    request.notes = this.model.notes;
    request.address = this.model.address;
    this.apiClient.updateSubscriptionContact(this.subscription_id, request).subscribe((company) => {
      // create a new backup copy
      this.bak(this.model);
      this.appState.getSubscriptionByKey(this.subscription_key).subscribe((sub) => {
        sub.model.contact = this.model;
        this.alertsService.create('success', 'Η αποθήκευση των αλλαγών σας έγινε με επιτυχία!');
      });
    }, (error) => {
      console.log(error);
      this.alertsService.create('error', 'Σφάλμα κατα την αποθήκευση! Μύνημα συστήματος: ' + error);
      // keep on editing...
      this.readonly = false;
    });
  }
}
