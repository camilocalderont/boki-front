import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { ServiceEntity, CreateServiceRequest } from '../model/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/services`;

  getAll(): Observable<ApiSuccessResponse<ServiceEntity[]>> {
    return this.http
      .get<ApiSuccessResponse<ServiceEntity[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<ServiceEntity[]>> {
    return this.http
      .get<ApiSuccessResponse<ServiceEntity[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  getByCategory(categoryId: number): Observable<ApiSuccessResponse<ServiceEntity[]>> {
    return this.http
      .get<ApiSuccessResponse<ServiceEntity[]>>(`${this.baseUrl}/category/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<ServiceEntity>> {
    return this.http
      .get<ApiSuccessResponse<ServiceEntity>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateServiceRequest): Observable<ApiSuccessResponse<ServiceEntity>> {
    return this.http
      .post<ApiSuccessResponse<ServiceEntity>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<CreateServiceRequest>): Observable<ApiSuccessResponse<ServiceEntity>> {
    return this.http
      .put<ApiSuccessResponse<ServiceEntity>>(`${this.baseUrl}/${id}`, data)
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
