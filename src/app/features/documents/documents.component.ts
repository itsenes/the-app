import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  title = null;
  documentType = null;
  constructor(private appState: AppStateService) {}

  ngOnInit() {
    // this.documentType = this.appState.document_types.filter(d => {d.id == })
  }

  ngOnDestroy() {
  }

}
