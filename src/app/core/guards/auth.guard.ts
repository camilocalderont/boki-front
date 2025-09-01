import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (environment.enableDebugMode) {
    if (isAuthenticated) {
      const user = authService.getCurrentUser();
    }
  }

  if (isAuthenticated) {
    return true;
  } else {
    if (environment.enableDebugMode) {
    }
    router.navigate(['/auth/login']);
    return false;
  }
};