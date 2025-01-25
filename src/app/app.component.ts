import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { CategoryNavbarComponent } from './layouts/category-navbar/category-navbar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CategoryNavbarComponent,CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'blog-app';
  hideElements: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      // Define routes where you want to hide components
      const hiddenRoutes = ['/login', '/register'];
      this.hideElements = hiddenRoutes.includes(this.router.url);
    });
  }
}
