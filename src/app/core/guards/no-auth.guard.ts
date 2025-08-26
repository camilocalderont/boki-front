import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

export const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (environment.enableDebugMode) {
    console.log('NoAuthGuard - Usuario autenticado:', isAuthenticated);
  }

  if (!isAuthenticated) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};