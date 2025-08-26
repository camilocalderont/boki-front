// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (environment.enableDebugMode) {
    console.log('AuthGuard - Usuario autenticado:', isAuthenticated);
    if (isAuthenticated) {
      const user = authService.getCurrentUser();
      console.log('👤 Usuario actual:', user?.VcEmail);
    }
  }

  if (isAuthenticated) {
    return true;
  } else {
    if (environment.enableDebugMode) {
      console.log('AuthGuard - Redirigiendo a login');
    }
    router.navigate(['/auth/login']);
    return false;
  }
};