import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-logged-out',
  templateUrl: './logged-out.component.html'
})
export class LoggedOutComponent implements OnInit {
  status = 'working on it, please give me a sec...';
  finished = false;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.completeSignout().then(() => {
      this.status = 'Thank you for using THE-APP';
      this.finished = true;
    });
  }

}
