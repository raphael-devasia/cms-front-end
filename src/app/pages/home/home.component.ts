import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { LimitWordsPipe } from '../../limit-words.pipe';

import { HeaderComponent } from '../../layouts/header/header.component';

interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LimitWordsPipe, RouterLink, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  userId!: string;
  categories: any[] = [];
  posts: any[] = [];
  private userService = inject(UserService);

  toastr = inject(ToastrService);
  // Pagination configuration
  pagination: PaginationConfig = {
    currentPage: 1,
    totalPages: 2,
    pageSize: 2, // Show 6 posts per page
    totalItems: 0,
  };

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
        
        this.posts = data.data; // Assuming `data.data` holds the array of posts
        this.pagination.totalItems = this.posts.length;
        this.pagination.totalPages = Math.ceil(
          this.posts.length / this.pagination.pageSize
        );
        
      },
      (error) => {
        console.error('Error fetching posts:', error); // Log error details
      }
    );
  }
  get paginatedPosts() {
    const startIndex =
      (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    return this.posts.slice(startIndex, endIndex);
  }

  get pages(): Array<number> {
    // Explicitly define return type
    const pages: number[] = []; // Explicitly type the array
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  changePage(page: number) {
    
    
    
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.currentPage = page;
    }
  }

  previousPage() {
    this.changePage(this.pagination.currentPage - 1);
  }

  nextPage() {
    console.log('next');
    
    this.changePage(this.pagination.currentPage + 1);
  }
}
