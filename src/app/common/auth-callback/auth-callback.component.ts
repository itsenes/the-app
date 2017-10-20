import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  template: '<p>signing in</p>'
})
export class AuthCallbackComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.completeAuthentication().then(() => {
      if (this.authService.isLoggedIn) {
        console.log('init user data and then redirect!');
        console.log(this.authService.currentUser().profile);
        this.router.navigate([this.authService.redirectUrl && '/']);
      } else {
        console.log('should redirect to unauthorized!');
        this.router.navigate(['/unauthorized']);
      }
    });
  }

}
