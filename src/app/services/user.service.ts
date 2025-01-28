import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private backendUrl = 'http://localhost:3000/api';
  // private backendUrl = 'https://cms-backend-1-jofv.onrender.com/api';

  private backendUrl = environment.backendUrl;

  private userProfile = JSON.parse(localStorage.getItem('userProfile')!);
  private userId = this.userProfile.userId;

  constructor(private http: HttpClient) {}

  // Fetch categories by user ID
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.backendUrl}/categories/all/${this.userId}`
    );
  }
  getallCategories(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.backendUrl}/categories/all/${this.userId}`
    );
  }

  // Fetch category by category ID
  getCategoryById(categoryId: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/categories/${categoryId}`);
  }

  // Update an existing category by category ID
  updateCategory(categoryId: string, category: any): Observable<any> {
    return this.http.put<any>(
      `${this.backendUrl}/categories/${categoryId}`,
      category
    );
  }

  // Delete a category by category ID
  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete<any>(`${this.backendUrl}/categories/${categoryId}`);
  }

  // Create a new category
  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/categories`, category);
  }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/posts/all/${this.userId}`);
  }
  getAllPosts(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/posts/all/${this.userId}`);
  }
  getPostById(postId: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/posts/${postId}`);
  }

  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.backendUrl}/posts/${postId}`);
  }

  toggleFeatured(postId: string, isFeatured: boolean): Observable<void> {
    return this.http.patch<void>(`${this.backendUrl}/posts/${postId}`, {
      isFeatured: isFeatured,
    });
  }
  getPostComments(postId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/comments/${postId}`);
  }
  getUserComments(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/posts/all/${userId}`);
  }
  createComment(comment: any): Observable<any> {
    console.log('the comment is ',comment);
    
    return this.http.post<any>(`${this.backendUrl}/comments`, comment);
  }
}
