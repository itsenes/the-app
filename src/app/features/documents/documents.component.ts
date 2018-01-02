import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { SubscriptionViewModel, DocumentTypeViewModel, DocumentViewModel } from '../../view-models/view-models';
import { ApiClient, Document } from '../../services/incontrl-apiclient';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material';
import { ViewModelLocator } from '../../view-models/view-models';

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
  filtertext: string = null;
  starthere = false;
  firsttime = true;
  showPager = false;
  showPagerBottom = false;
  status = '';

  constructor(private router: Router, private appState: AppStateService, private route: ActivatedRoute,
    private apiClient: ApiClient, private sanitizer: DomSanitizer, private viewModelLocator: ViewModelLocator) { }

  ngOnInit() {
    this.params_sub = this.route.params.subscribe((params) => {
      this.appState.getSubscriptionByKey(params['subscription-alias']).subscribe((sub) => {
        this.subscription = sub;
        const id = params['typeId'];
        this.subscription.getDocumentType(id).subscribe((docType) => {
          this.status = '';
          this.documentType = docType;
          this.showInfo = false;
          this.selected = null;
          this.firsttime = true;
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
    // if we wanted to reset the showinfo panel...
    // this.showInfo = false;
    // this.selected = null;
    this.search();
  }

  cansearch() {
    return this.filtertext !== this.searchText;
  }

  canclear() {
    return this.filtertext && (this.filtertext === this.searchText);
  }

  search() {
    this.status = 'αναζήτηση, παρακαλώ περιμένετε...';
    this.filtertext = this.searchText;
    this.apiClient.getDocuments(this.subscription.id, this.pageindex + 1, this.pagesize, true, undefined, undefined,
      undefined, undefined, undefined, undefined, undefined, [this.documentType.id], undefined, undefined,
      `${this.sortfield}${this.sortdirection}`, this.searchText)
      .subscribe((response) => {
        this.status = `βρέθηκαν ${response.count} παραστατικά.`;
        this.count = response.count;
        this.documents = response.items.map((doc) => {
          const vm = this.viewModelLocator.getInstance<DocumentViewModel, Document>(DocumentViewModel, doc);
          vm.documentType = this.documentType;
          vm.safePortalLink = this.sanitizer.bypassSecurityTrustResourceUrl(vm.portalLink);
          return vm;
        });
        this.norecords = (this.documents == null || this.documents.length === 0);
        this.showPager = !this.norecords;
        this.showPagerBottom = this.showPager && this.documents.length > 9;
        if (this.norecords) {
          this.showInfo = false;
          this.selected = null;
          this.status = 'δεν βρέθηκαν εγγραφές.';
        }
        if (this.firsttime) {
          this.starthere = this.norecords;
          this.firsttime = false;
        }
        if (this.starthere && this.norecords) {
          this.status = '';
        }
      });
  }

  clear() {
    this.searchText = '';
    this.search();
  }

  dosearch() {
    this.pageindex = 0;
    this.search();
  }

  toggleInfoPanel() {
    this.showInfo = !this.showInfo;
  }

  add_new() {
    this.router.navigateByUrl(`app/${this.subscription.alias}/documents/${this.documentType.id}/new`);
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
