import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../view-models/view-models';
import { ApiClient, Document } from '../../services/incontrl-apiclient';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  title = null;
  subscription: SubscriptionViewModel = null;
  params_sub = null;
  documentType: DocumentTypeViewModel = null;
  documents: DocumentViewModel[] = null;
  viewmode = 'grid';
  norecords = null;
  sortfield = 'date';
  sortdirection = '+';
  busy = false;
  searchText = '';
  pageindex = 1;
  pagesize = 100;
  showInfo = false;
  selected: DocumentViewModel = null;
  constructor(private appState: AppStateService, private route: ActivatedRoute,
    private apiClient: ApiClient, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub;
        const id = params['typeId'];
        this.subscription.getDocumentType(id).subscribe((docType) => {
          this.documentType = docType;
          this.search();
        });
      });
    });
  }

  search() {
    const observable = this.apiClient.getDocuments(this.subscription.id, undefined, undefined,
      undefined, undefined, undefined, undefined, [this.documentType.id], undefined,
      this.pageindex, this.pagesize, `${this.sortfield}${this.sortdirection}`, this.searchText, true).subscribe((response) => {
        this.documents = response.items.map((doc) => {
          const vm = new DocumentViewModel(doc, this.documentType, '');
          vm.safe_portal_link = this.sanitizer.bypassSecurityTrustResourceUrl(vm.portal_link);
          return vm;
        });
        this.norecords = (this.documents == null || this.documents.length === 0);
      });
  }

  clear() {
    this.searchText = '';
    this.search();
  }

  toggleInfoPanel() {
    this.showInfo = !this.showInfo;
  }

  add_new() {
  }

  setSelected(doc) {
    this.selected = doc;
    this.showInfo = true;
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

}
