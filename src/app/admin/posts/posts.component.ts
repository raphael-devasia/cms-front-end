// posts.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { BackToDashboardComponent } from '../../shared/back-to-dashboard/back-to-dashboard.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    DeleteModalComponent,
    BackToDashboardComponent,
    AdminNavbarComponent,
  ],
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
    public dialog: MatDialog,
    
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
    console.log(postId, isFeatured);

    const action = isFeatured ? 'unmark' : 'mark';
    this.postsService.toggleFeatured(postId, !isFeatured).subscribe(
      () => {
        this.posts = this.posts.map((post) => {
          if (post.id === postId) {
            return { ...post, isFeatured: !isFeatured };
          }
          return post;
        });
       this.fetchPosts()
        this.toastr.success(`Post ${action}ed as featured successfully`);
      },
      (error) =>  this.toastr.error(`Error ${action}ing featured post`)
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
      (error) => this.toastr.error(`Failed to delete Post`, 'Error')
    );
  }
}
