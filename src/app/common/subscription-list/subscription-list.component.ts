import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';
@Component({
  selector: 'app-subscription-list',
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  private _data = '';
  @Output() select: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set subscriptions(data: any) {
    this._data = data;
  }
  get subscriptions(): any { return this._data; }

  selectSubscription(subscription) {
    this.select.next(subscription);
  }

  constructor(private authService: AuthService, private appState: AppStateService) {
  }

  ngOnInit() {
  }
}
