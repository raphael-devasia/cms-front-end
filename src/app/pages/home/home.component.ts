import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { LimitWordsPipe } from '../../limit-words.pipe';

import { HeaderComponent } from '../../layouts/header/header.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LimitWordsPipe,RouterLink,HeaderComponent,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  userId!: string;
  categories: any[] = [];
  posts: any[] = [];
  private userService = inject(UserService);

  toastr = inject(ToastrService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the user ID from the route parameters
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id') || ''; // 'id' is the dynamic route parameter
    });

    this.getCategories();
    this.fetchPosts();
  }
  getCategories() {
    this.userService.getallCategories(this.userId).subscribe(
      (data: any) => {
        this.categories = data.data;
        console.log(this.categories);
      },
      (error) => {
        this.toastr.error('Failed to fetch categories');
      }
    );
  }
  fetchPosts() {
    this.userService.getAllPosts(this.userId).subscribe(
      (data: any) => {
        console.log('Fetched posts successfully:', data); // Log the complete response
        this.posts = data.data; // Assuming `data.data` holds the array of posts
        console.log(this.posts);
      },
      (error) => {
        console.error('Error fetching posts:', error); // Log error details
      }
    );
  }
}
