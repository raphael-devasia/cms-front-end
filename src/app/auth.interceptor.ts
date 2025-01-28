import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Inject ToastrService and AuthService
  const toastr = inject(ToastrService);
  const token = localStorage.getItem('userToken');

  if (req.url.includes('X-Amz-Signature')) {
    return next(req);
  }
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // return next(req);

  // Pass the cloned request to the next handler and handle errors
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Show a toaster for unauthorized errors
        toastr.error(
          'You are not authorized to perform this action.',
          'Unauthorized'
        );
      } else if (error.status === 403) {
        // Handle forbidden errors
        toastr.warning(
          'You do not have permission to perform this action.',
          'Forbidden'
        );
      } else if (error.status === 500) {
        // Handle server errors
        toastr.error(
          'An unexpected server error occurred. Please try again later.',
          'Server Error'
        );
      } else {
        // Handle other errors
        toastr.error(
          'An error occurred while processing your request.',
          'Error'
        );
      }
      console.error('HTTP Error:', error);
      return throwError(() => error); // Re-throw the error for further handling
    })
  );
};
