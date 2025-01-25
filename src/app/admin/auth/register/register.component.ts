import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[A-Za-z]+$/), // Letters only, no spaces or special characters
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[A-Za-z]+$/), // Letters only, no spaces or special characters
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email], // Valid email
        ],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9]\d{9}$/), // Valid Indian phone number
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8), // Minimum 8 characters
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ), // At least 1 number, 1 capital letter, and 1 special character
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.matchPasswords } // Custom validator for password matching
    );
  }

  // Custom validator to check if passwords match
  private matchPasswords(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  registerFormSubmit(): void {
    if (this.registerForm.valid) {
      // Show loading or disable the button to prevent multiple submissions
      console.log('Registration Form Data:', this.registerForm.value);

      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (data) => {
          // Success: Display success message and redirect
          this.toastr.success('Registration successful!', 'Success');
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirect to login page after 2 seconds
          }, 2000);
        },
        error: (error) => {
          // Error: Display the error message
          console.error('Registration failed:', error);
          const errorMessage =
            error?.error?.message || 'An error occurred. Please try again.';
          this.toastr.error(errorMessage, 'Error');
        },
      });
    } else {
      // Form is invalid, show a general error message
      this.toastr.error('Please fill out the form correctly.', 'Invalid Form');
    }
  }

  // getFirstErrorMessage(): string | null {
  //   for (const control in this.registerForm.controls) {
  //     if (this.registerForm.controls[control].errors) {
  //       if (this.registerForm.controls[control].hasError('required')) {
  //         return `${control} is required.`;
  //       }
  //       if (this.registerForm.controls[control].hasError('email')) {
  //         return 'Invalid email address.';
  //       }
  //       if (this.registerForm.controls[control].hasError('minlength')) {
  //         return `${control} must be at least ${this.registerForm.controls[control].errors['minlength'].requiredLength} characters.`;
  //       }
  //       if (this.registerForm.controls[control].hasError('pattern')) {
  //         return 'Invalid phone number. It must be 10 digits.';
  //       }
  //     }
  //   }
  //   if (this.registerForm.hasError('passwordsMismatch')) {
  //     return 'Passwords do not match.';
  //   }
  //   return null;
  // }
  getFirstErrorMessage(): string | null {
    for (const controlName in this.registerForm.controls) {
      const control = this.registerForm.controls[controlName];

      if (control.touched && control.dirty && control.errors) {
        if (control.hasError('required')) {
          return `${this.capitalize(controlName)} is required.`;
        }
        if (control.hasError('minlength')) {
          return `${this.capitalize(controlName)} must be at least ${
            control.errors['minlength'].requiredLength
          } characters long.`;
        }
        if (control.hasError('pattern')) {
          switch (controlName) {
            case 'firstName':
            case 'lastName':
              return `${this.capitalize(
                controlName
              )} must contain only letters with no spaces or special characters.`;
            case 'phone':
              return `Phone number must be a valid 10-digit Indian number starting with 6-9.`;
            case 'password':
              return `Password must be at least 8 characters long, with at least 1 capital letter, 1 number, and 1 special character.`;
            default:
              return 'Invalid input.';
          }
        }
        if (control.hasError('email')) {
          return `Please enter a valid email address.`;
        }
      }
    }

    // Form-level errors
    if (this.registerForm.hasError('passwordsMismatch')) {
      return `Passwords do not match.`;
    }

    return null;
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  goToLogin() {
    this.router.navigate(['/login']); // Navigate to the /login route
  }
  
}
