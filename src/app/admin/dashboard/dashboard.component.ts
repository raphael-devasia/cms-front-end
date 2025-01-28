import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminNavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private userProfile = JSON.parse(localStorage.getItem('userProfile')!);
  private userId = this.userProfile.userId;
  constructor(private router: Router) {}

  navigateToProfile(): void {
    this.router.navigate([`/profile/${this.userId}`]);
  }
}
