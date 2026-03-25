import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Category, CreateCategoryRequest } from '../model/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/category-services`;

  getAll(): Observable<ApiSuccessResponse<Category[]>> {
    return this.http
      .get<ApiSuccessResponse<Category[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Category[]>> {
    return this.http
      .get<ApiSuccessResponse<Category[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateCategoryRequest): Observable<ApiSuccessResponse<Category>> {
    return this.http
      .post<ApiSuccessResponse<Category>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<CreateCategoryRequest>): Observable<ApiSuccessResponse<Category>> {
    return this.http
      .put<ApiSuccessResponse<Category>>(`${this.baseUrl}/${id}`, data)
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
