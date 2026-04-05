import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../lib/alerts/alert.service';
import { STORAGE_KEYS, ROUTES } from '../config';

let isRedirectingToLogin = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        alertService.showError('Error de conexión. Verifica tu red.');
      }

      if (error.status === 401 && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        alertService.showError('Tu sesión expiró. Inicia sesión de nuevo.');
        router.navigateByUrl(`/${ROUTES.AUTH.LOGIN}`).then(() => {
          isRedirectingToLogin = false;
        });
      }

      return throwError(() => error);
    }),
  );
};
