import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Professional } from '../model/professional.model';

@Injectable({ providedIn: 'root' })
export class ProfessionalApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/professional`;

  getAll(): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  getByService(serviceId: number): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(`${this.baseUrl}/service/${serviceId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const customError: CustomError = new Error(error.error?.message ?? 'Error desconocido') as CustomError;
    customError.code = error.error?.errors?.[0]?.code ?? 'UNKNOWN';
    customError.status = error.status;
    customError.originalError = error;
    return throwError(() => customError);
  }
}
