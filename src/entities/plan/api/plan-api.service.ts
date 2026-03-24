import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import {
  Plan,
  CompanyPlan,
  ControlToken,
  CreateCompanyPlanRequest,
  CreateControlTokenRequest,
} from '../model/plan.model';

@Injectable({
  providedIn: 'root',
})
export class PlanApiService {
  private readonly baseUrl = APP_CONSTANTS.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiSuccessResponse<Plan[]>> {
    const url = `${this.baseUrl}/plans`;

    return this.http
      .get<ApiSuccessResponse<Plan[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getById(id: number): Observable<ApiSuccessResponse<Plan>> {
    const url = `${this.baseUrl}/plans/${id}`;

    return this.http
      .get<ApiSuccessResponse<Plan>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getCompanyPlans(companyId: number): Observable<ApiSuccessResponse<CompanyPlan[]>> {
    const url = `${this.baseUrl}/company-plans/company/${companyId}`;

    return this.http
      .get<ApiSuccessResponse<CompanyPlan[]>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createCompanyPlan(data: CreateCompanyPlanRequest): Observable<ApiSuccessResponse<CompanyPlan>> {
    const url = `${this.baseUrl}/company-plans`;

    return this.http
      .post<ApiSuccessResponse<CompanyPlan>>(url, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  deleteCompanyPlan(id: number): Observable<ApiSuccessResponse<null>> {
    const url = `${this.baseUrl}/company-plans/${id}`;

    return this.http
      .delete<ApiSuccessResponse<null>>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createControlToken(data: CreateControlTokenRequest): Observable<ApiSuccessResponse<ControlToken>> {
    const url = `${this.baseUrl}/company-plan-control-tokens`;

    return this.http
      .post<ApiSuccessResponse<ControlToken>>(url, data)
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
