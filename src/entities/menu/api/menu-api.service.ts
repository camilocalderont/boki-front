import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import type { BackendMenuItem } from '../model/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/users`;

  getUserMenus(userId: number): Observable<{ message: string; data: BackendMenuItem[] }> {
    return this.http
      .get<{ message: string; data: BackendMenuItem[] }>(`${this.baseUrl}/${userId}/menus`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error(error.error?.message ?? 'Error cargando menús'));
  }
}
