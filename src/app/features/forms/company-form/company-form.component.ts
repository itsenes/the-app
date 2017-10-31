import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['../forms.components.scss']
})
export class CompanyFormComponent implements OnInit {
  private _data: any = { company: { address: {}},  contact: {} };
  @Input()
  set data(value: any) {
    this._data = value;
  }
  get data(): any { return this._data; }

  constructor() { }

  ngOnInit() {
  }

}
