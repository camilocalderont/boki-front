import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Faq, CreateFaqRequest } from '../model/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/faqs`;

  getAll(): Observable<ApiSuccessResponse<Faq[]>> {
    return this.http
      .get<ApiSuccessResponse<Faq[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Faq[]>> {
    return this.http
      .get<ApiSuccessResponse<Faq[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateFaqRequest): Observable<ApiSuccessResponse<Faq>> {
    return this.http
      .post<ApiSuccessResponse<Faq>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<CreateFaqRequest>): Observable<ApiSuccessResponse<Faq>> {
    return this.http
      .patch<ApiSuccessResponse<Faq>>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http
      .delete<ApiSuccessResponse<void>>(`${this.baseUrl}/${id}`)
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
