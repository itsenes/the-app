import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: '<div class="view-content"><h3>Error 403: Unauthorized</h3></div>'
})

export class UnauthorizedComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
