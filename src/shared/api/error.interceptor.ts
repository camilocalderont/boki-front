import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../lib/alerts/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo mostrar toast para errores de red (sin respuesta del servidor).
      // Los errores con respuesta (4xx, 5xx) se manejan en el service-level handleError
      // y se muestran en el page-level subscribe({ error: ... }).
      if (error.status === 0) {
        alertService.showError('Error de conexión. Verifica tu red.');
      }
      return throwError(() => error);
    }),
  );
};
