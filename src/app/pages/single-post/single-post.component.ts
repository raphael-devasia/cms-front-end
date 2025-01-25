import { Component, inject } from '@angular/core';
import { CommentsListComponent } from '../../comments/comments-list/comments-list.component';
import { CommentFormComponent } from '../../comments/comment-form/comment-form.component';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layouts/header/header.component';
interface Category {
  category: string;
  categoryId: string;
}

interface Post {
  category: Category;
  _id: string;
  title: string;
  permalink: string;
  content: string;
  image: string;
  excerpt: string;
  isFeatured: boolean;
  views: number;
  status: string;
  createdAt: string;
  userId: string;
  __v: number;
}

@Component({
  selector: 'app-single-post',
  standalone: true,
  imports: [
    CommentsListComponent,
    CommentFormComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
  ],
  templateUrl: './single-post.component.html',
  styleUrl: './single-post.component.css',
})
export class SinglePostComponent {
  postId!: string;
  categories: any[] = [];
  posts!: Post;
  userId!:string;

  private userService = inject(UserService);

  toastr = inject(ToastrService);

  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    // Get the user ID from the route parameters
    this.route.paramMap.subscribe((params) => {
      this.postId = params.get('id') || ''; // 'id' is the dynamic route parameter
     
     
    });
    
    this.getPost();
    
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
  getPost() {
    this.userService.getPostById(this.postId).subscribe(
      (data: any) => {
        this.posts = data.data;
        console.log(this.posts);
        this.userId=this.posts.userId;
        this.getCategories();
      },
      (error) => {
        this.toastr.error('Failed to fetch post');
      }
    );
  }
}
