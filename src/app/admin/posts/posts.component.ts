// posts.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';



@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, DeleteModalComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  router = inject(Router);
  selectedPostId!: string;
  showDeleteModal: boolean = false;
  toastr = inject(ToastrService);

  constructor(
    private postsService: UserService,
  
  ) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.postsService.getPosts().subscribe(
      (data: any) => {
        console.log('Fetched posts successfully:', data); // Log the complete response
        this.posts = data.data; // Assuming `data.data` holds the array of posts
      },
      (error) => {
        console.error('Error fetching posts:', error); // Log error details
      }
    );
  }

  editPost(postId: string) {
    console.log(postId);

    // Navigate to the edit page, passing the postId as a parameter
    this.router.navigate(['/edit-post', postId]);
    console.log('Navigating to edit page for post with ID:', postId);
  }

  deletePost(postId: string) {
    this.showDeleteModal = true;
    this.selectedPostId = postId;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  toggleFeatured(postId: string, isFeatured: boolean) {
    const action = isFeatured ? 'unmark' : 'mark';
    this.postsService.toggleFeatured(postId, !isFeatured).subscribe(
      () => {
        this.posts = this.posts.map((post) => {
          if (post.id === postId) {
            return { ...post, featured: !isFeatured };
          }
          return post;
        });
        console.log(`Post ${action}ed as featured successfully`);
      },
      (error) => console.error(`Error ${action}ing featured post:`, error)
    );
  }
  navigateToWriteABlog() {
    this.router.navigate(['/create-post']);
  }

  deleteResource(postId: string, target: string): void {
    console.log(`Deleting ${target} with ID: ${postId}`);
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.toastr.success(`${target} deleted successfully`, 'Success');
      },
      (error) =>
        
       this.toastr.error(`Failed to delete Post`, 'Error')
    );
  }
}
