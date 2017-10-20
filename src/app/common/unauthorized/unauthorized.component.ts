import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: '<h1>Error 403: Unauthorized</h1>'
})

export class UnauthorizedComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
