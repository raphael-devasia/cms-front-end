import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  submitted = false;
  toastr = inject(ToastrService);
  authService = inject(AuthService);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  ngOnInit(): void {
    const token = localStorage.getItem('userToken');

    if (token) {
      this.router.navigate(['dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  loginFormSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const formValue = this.loginForm.value; // Get the form value here

    this.authService.loginUser(formValue).subscribe(
      (res: any) => {
        console.log(res.data);
        localStorage.setItem('userToken', res.data.token); // Save token in localStorage
        localStorage.setItem('userProfile', JSON.stringify(res.data)); // Save entire user object as string

        this.loginForm.reset(); // Reset form on success
        this.router.navigate(['dashboard']); // Navigate to dashboard

        // Show success toast
        this.toastr.success('Login successful!', 'Success');
      },
      (error) => {
        // Reset the password field on error
        this.loginForm.controls['password'].reset();
        this.toastr.error(error.error.message || 'An error occurred','Sorry'); // Display the error message
      }
    );
  }

  getFirstErrorMessage(): string | null {
    const fields = ['email', 'password'];

    for (const field of fields) {
      if (this.isFieldInvalid(field)) {
        return this.getErrorMessage(field);
      }
    }

    return null;
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field
      ? field.invalid && (field.touched || field.dirty || this.submitted)
      : false;
  }
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field) {
      if (field.errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['onlyAlphabets']) {
        return `${fieldName} must contain only alphabets`;
      }
      if (field.errors?.['email']) {
        return 'Invalid email format';
      }
      if (field.errors?.['pattern']) {
        return 'Invalid phone number format';
      }
    }
    return '';
  }
  goToSignup() {
    console.log('activated');

    
      this.router.navigate(['sign-up']);
    
  }
}
