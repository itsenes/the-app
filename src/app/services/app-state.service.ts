import { Injectable } from '@angular/core';

@Injectable()
export class AppStateService {
  public subscriptions = [];
  public document_types = [];
  public selected_subscription: any = null;
  constructor() { }

}
