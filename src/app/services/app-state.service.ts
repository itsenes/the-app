import { Injectable } from '@angular/core';
// a simple singleton to maintain app state for now, other patterns could be applied
@Injectable()
export class AppStateService {
  public subscriptions = [];
  public document_types = [];
  public selected_subscription: any = null;
  constructor() { }
}
