import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../view-models/view-models';
import { ApiClient, Document } from '../../services/incontrl-apiclient';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  title = null;
  subscription: SubscriptionViewModel = null;
  params_sub = null;
  documentType: DocumentTypeViewModel = null;
  documents: DocumentViewModel[] = null;

  constructor(private appState: AppStateService, private route: ActivatedRoute, private apiClient: ApiClient) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub;
        const id = params['typeId'];
        this.subscription.getDocumentType(id).subscribe((docType) => {
          this.documentType = docType;
          this.apiClient.getDocuments(this.subscription.id).subscribe((response) => {
            this.documents = response.items.map((doc) => {
              return new DocumentViewModel(doc, docType, '');
            });
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

}
