import { Component, inject } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  app = inject(AppComponent);
  username = '';
  password = '';

  onLogin() {
    this.app.login(this.username, this.password);
  }
}
