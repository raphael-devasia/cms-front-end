import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Replace this with your actual authentication check logic
  const isLoggedIn = !!localStorage.getItem('userToken');

  if (isLoggedIn) {
    return true; // Allow access
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Redirect to login
    return false; // Deny access
  }
};
