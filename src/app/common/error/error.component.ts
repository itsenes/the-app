import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  public error: string = null;
  constructor(private appState: AppStateService) {
    this.error = appState.getLastError();
    // ready for the next error that will occur in THE-APP
    appState.clearError();
  }

  ngOnInit() {
  }

}
