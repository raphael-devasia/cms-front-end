import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { BackToDashboardComponent } from '../../shared/back-to-dashboard/back-to-dashboard.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    BackToDashboardComponent,AdminNavbarComponent
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent {
  categories: any[] = [];
  userId: string = '';
  categoryName: string = '';
  isEdit: boolean = false; // Flag to check if editing
  categoryIdToUpdate: string = '';
  toastr = inject(ToastrService);

  // Initialize the form group
  categoryForm: FormGroup;

  constructor(private http: UserService) {
    // Create form group and define form controls
    this.categoryForm = new FormGroup({
      categoryName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$'),
      ]), // Required validation
    });
  }

  ngOnInit() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')!);
    this.userId = userProfile.userId;
    this.getCategories();
  }

  // Function to fetch categories
  getCategories() {
    this.http.getCategories().subscribe(
      (data: any) => {
        this.categories = data.data;
        console.log(this.categories);
      },
      (error) => {
        this.toastr.error('Failed to fetch categories');
      }
    );
  }

  // Function to handle category form submission
  handleCategorySubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    if (this.isEdit) {
      this.updateCategory();
    } else {
      this.addCategory();
    }
  }

  // Add new category
  addCategory() {
    if (this.categories.length >= 6) {
      this.toastr.error('You can only add a maximum of 6 categories');
      return;
    }

    const newCategory = {
      name: this.categoryForm.value.categoryName,
      userId: this.userId,
    };

    this.http.createCategory(newCategory).subscribe(
      (response) => {
        this.toastr.success('Category added successfully');
        this.getCategories();
        this.categoryForm.reset(); // Reset the form input
      },
      (error) => {
        this.toastr.error('Failed to add category');
      }
    );
  }

  // Update existing category
  updateCategory() {
    const updatedCategory = {
      name: this.categoryForm.value.categoryName,
    };

    this.http
      .updateCategory(this.categoryIdToUpdate, updatedCategory)
      .subscribe(
        (response) => {
          this.toastr.success('Category updated successfully');
          this.getCategories();
          this.categoryForm.reset(); // Reset the form input
          this.isEdit = false; // Reset edit flag
        },
        (error) => {
          this.toastr.error('Failed to update category');
        }
      );
  }

  // Edit existing category
  editCategory(categoryId: string, categoryName: string) {
    this.isEdit = true;
    this.categoryIdToUpdate = categoryId;
    this.categoryForm.setValue({
      categoryName: categoryName, // Populate the form with category data
    });
  }

  // Handle category delete
  deleteCategory(categoryId: string) {
    this.http.deleteCategory(categoryId).subscribe(
      (response) => {
        this.toastr.success('Category deleted successfully');
        this.getCategories();
      },
      (error) => {
        this.toastr.error('Failed to delete category');
      }
    );
  }
  cancelEdit(){
    this.isEdit=false
  }
}
