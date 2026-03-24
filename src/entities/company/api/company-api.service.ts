import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import {
  Company,
  CompanyPrompt,
  CreateCompanyRequest,
  CreateCompanyPromptRequest,
} from '../model/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyApiService {
  private readonly baseUrl = APP_CONSTANTS.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiSuccessResponse<Company[]>> {
    const url = `${this.baseUrl}/companies`;

    return this.http
      .get<ApiSuccessResponse<Company[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getById(id: number): Observable<ApiSuccessResponse<Company>> {
    const url = `${this.baseUrl}/companies/${id}`;

    return this.http
      .get<ApiSuccessResponse<Company>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  create(data: CreateCompanyRequest): Observable<ApiSuccessResponse<Company>> {
    const url = `${this.baseUrl}/companies`;

    return this.http
      .post<ApiSuccessResponse<Company>>(url, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  update(id: number, data: CreateCompanyRequest): Observable<ApiSuccessResponse<Company>> {
    const url = `${this.baseUrl}/companies/${id}`;

    return this.http
      .put<ApiSuccessResponse<Company>>(url, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getUserCompanies(userId: number): Observable<ApiSuccessResponse<Company[]>> {
    const url = `${this.baseUrl}/companies/user/${userId}`;

    return this.http
      .get<ApiSuccessResponse<Company[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getPermissionsByUser(userId: number): Observable<ApiSuccessResponse<any[]>> {
    const url = `${this.baseUrl}/user-company-permission/by-user/${userId}`;

    return this.http
      .get<ApiSuccessResponse<any[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getPrompts(companyId: number): Observable<ApiSuccessResponse<CompanyPrompt[]>> {
    const url = `${this.baseUrl}/company-prompts/company/${companyId}`;

    return this.http
      .get<ApiSuccessResponse<CompanyPrompt[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createPrompt(data: CreateCompanyPromptRequest): Observable<ApiSuccessResponse<CompanyPrompt>> {
    const url = `${this.baseUrl}/company-prompts`;

    return this.http
      .post<ApiSuccessResponse<CompanyPrompt>>(url, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  deletePrompt(id: number): Observable<ApiSuccessResponse<null>> {
    const url = `${this.baseUrl}/company-prompts/${id}`;

    return this.http
      .delete<ApiSuccessResponse<null>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    } else if (error.status === 400) {
      errorMessage = 'Datos invalidos enviados';
      errorCode = 'INVALID_DATA';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales invalidas';
      errorCode = 'INVALID_CREDENTIALS';
    } else if (error.status === 409) {
      errorMessage = 'El registro ya existe';
      errorCode = 'ALREADY_EXISTS';
    } else if (error.status === 422) {
      errorMessage = 'Error de validacion';
      errorCode = 'VALIDATION_ERROR';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexion';
      errorCode = 'NETWORK_ERROR';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor';
      errorCode = 'SERVER_ERROR';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    customError.originalError = error;

    return throwError(() => customError);
  }
}
