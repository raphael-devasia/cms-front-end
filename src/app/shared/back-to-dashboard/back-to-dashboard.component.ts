import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-to-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './back-to-dashboard.component.html',
  styleUrl: './back-to-dashboard.component.css',
})
export class BackToDashboardComponent {
  @Input() label: string = 'Back to Dashboard'; // Default button label

  constructor(private router: Router) {}

  navigateToDashboard() {
    this.router.navigate(['/dashboard']); // Replace '/dashboard' with your actual dashboard route
  }
}
