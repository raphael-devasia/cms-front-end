import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css',
})
export class AdminNavbarComponent implements OnInit {
  userName!: string;
  constructor(private router: Router) {}
  ngOnInit(): void {
    // Retrieve the user profile from localStorage (assuming it is stored as a JSON string)
    const userProfile = localStorage.getItem('userProfile');

    if (userProfile) {
      // Parse the JSON string to an object
      const parsedProfile = JSON.parse(userProfile);

      // Access the firstname from the parsed object
      this.userName = parsedProfile.firstName;
    } else {
      // Handle the case when there is no user profile in localStorage
      this.userName = 'Guest';
    }
  }

  logout() {
    // Remove the user token from local storage
    localStorage.removeItem('userToken');

    // Optionally, redirect to the login page or another appropriate page after logging out
    this.router.navigate(['/login']);
  }
}
