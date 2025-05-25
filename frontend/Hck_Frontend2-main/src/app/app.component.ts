import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router, NavigationStart } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'eco-inventory-management';
  isLoggedIn = false;
  userRole: 'user' | 'admin' | '' = '';

  constructor(private router: Router) {
    // Restore login state from localStorage
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUserRole = localStorage.getItem('userRole');
    this.isLoggedIn = storedLoggedIn === 'true';
    this.userRole = storedUserRole === 'user' || storedUserRole === 'admin' ? storedUserRole : '';
  }

  showLoginInfo() {
    alert('Please login to access this feature.');
  }

  // Example: Call this after successful login
  login(username: string, password: string) {
    if (username === 'user' && password === '12345') {
      this.isLoggedIn = true;
      this.userRole = 'user';
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      this.router.navigate(['/inventory-tracking']);
    } else if (username === 'admin' && password === '12345') {
      this.isLoggedIn = true;
      this.userRole = 'admin';
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      this.router.navigate(['/inventory-tracking']);
    } else {
      alert('Invalid username or password');
      this.isLoggedIn = false;
      this.userRole = '';
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.userRole = '';
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
