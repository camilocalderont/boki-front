import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';
import { Service } from '../shared/interfaces/service.interface';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiSuccessResponse<Service[]>> {
    return this.http
      .get<ApiSuccessResponse<Service[]>>(`${this.baseUrl}/services`)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Service[]>> {
    return this.http
      .get<ApiSuccessResponse<Service[]>>(
        `${this.baseUrl}/services?CompanyId=${companyId}`
      )
      .pipe(catchError(this.handleError));
  }

  getByCategory(categoryId: number): Observable<ApiSuccessResponse<Service[]>> {
    return this.http
      .get<ApiSuccessResponse<Service[]>>(
        `${this.baseUrl}/services?CategoryId=${categoryId}`
      )
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<Service>> {
    return this.http
      .get<ApiSuccessResponse<Service>>(`${this.baseUrl}/services/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    return throwError(() => customError);
  }
}
