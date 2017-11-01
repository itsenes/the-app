import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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
    this.bak(this.model);
    if (null != this.model_changed) {
      this.model_changed.next(this.model);
    }
  }

  constructor() {
    this.model = { company: { address: {} }, contact: {} };
  }

  ngOnInit() {
  }

}
