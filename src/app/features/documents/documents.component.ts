import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../view-models/view-models';
import { ApiClient, Document } from '../../services/incontrl-apiclient';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material';


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
  pageindex = 0;
  pagesize = 10;
  showInfo = false;
  selected: DocumentViewModel = null;
  file_url;
  count = 0;

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

  pagerEvent(pagerEvent: PageEvent) {
    if (this.pagesize !== pagerEvent.pageSize) {
      this.pagesize = pagerEvent.pageSize;
      this.pageindex = 0;
    } else {
      this.pageindex = pagerEvent.pageIndex;
    }
    this.showInfo = false;
    this.selected = null;
    // and search!
    this.search();
  }

  search() {
    const observable = this.apiClient.getDocuments(this.subscription.id, undefined, undefined,
      undefined, undefined, undefined, undefined, [this.documentType.id], undefined,
      this.pageindex + 1, this.pagesize, `${this.sortfield}${this.sortdirection}`, this.searchText, true).subscribe((response) => {
        this.count = response.count;
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

  download_file(event) {
    const target = event.currentTarget;
    if (null != this.selected.model.permaLink) {
      return;
    }
    const file_type = this.selected.documentType.model.template.contentType;
    this.apiClient.getDocument(this.subscription.id, this.selected.id)
      .subscribe((response) => {
        // const blob: Blob = new Blob([response.data], {
        //   type: `"${file_type}"`
        // });
        const blob: Blob = new Blob([], {
          type: `"${file_type}"`
        });
        this.file_url = window.URL.createObjectURL(blob);
        target.href = this.file_url;
        target.click();
      });
  }

  ngOnDestroy() {
    this.params_sub.unsubscribe();
  }

}
