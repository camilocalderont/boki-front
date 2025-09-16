import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GetAllPlansRs } from '../shared/interfaces/plan.interface';
import { Observable, catchError, throwError } from 'rxjs';
import { GetCompanyPlansRs, PostCompanyPlanRq } from '../shared/interfaces/company-plan.interface';
import { GetCompanyPlanControlTokenRs, PostCompanyPlanControlTokenRq } from '../shared/interfaces/company-plan-control-token.interface';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  constructor(private http: HttpClient) { }

  getAllPlans(): Observable<ApiSuccessResponse<GetAllPlansRs[]>> {
    const url = `${this.baseUrl}/plans`;

    return this.http.get<ApiSuccessResponse<GetAllPlansRs[]>>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllCompanyPlans(): Observable<ApiSuccessResponse<GetCompanyPlansRs[]>> {
    const url = `${this.baseUrl}/company-plans`;

    return this.http.get<ApiSuccessResponse<GetCompanyPlansRs[]>>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCompanyPlanByCompanyId(companyId: number): Observable<ApiSuccessResponse<GetCompanyPlansRs>> {
    const url = `${this.baseUrl}/company-plans/company/${companyId}`;

    return this.http.get<ApiSuccessResponse<GetCompanyPlansRs>>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  postCompanyPlan(data: PostCompanyPlanRq): Observable<ApiSuccessResponse<GetCompanyPlansRs>> {
    const url = `${this.baseUrl}/company-plans`;

    return this.http.post<ApiSuccessResponse<GetCompanyPlansRs>>(url, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  putCompanyPlan(id: number, data: PostCompanyPlanRq): Observable<ApiSuccessResponse<GetCompanyPlansRs>> {
    const url = `${this.baseUrl}/company-plans/${id}`;

    return this.http.put<ApiSuccessResponse<GetCompanyPlansRs>>(url, data)
      .pipe(
        catchError(this.handleError)
    );
  }

  getAllCompanyPlanControlToken(): Observable<ApiSuccessResponse<GetCompanyPlanControlTokenRs[]>> {
    const url = `${this.baseUrl}/company-plan-control-token`;

    return this.http.get<ApiSuccessResponse<GetCompanyPlanControlTokenRs[]>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  postCompanyPlanControlToken(data: PostCompanyPlanControlTokenRq): Observable<ApiSuccessResponse<PostCompanyPlanControlTokenRq>> {
    const url = `${this.baseUrl}/company-plan-control-token`;

    return this.http.post<ApiSuccessResponse<GetCompanyPlanControlTokenRs>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'Error desconocido';
      let errorCode = 'UNKNOWN_ERROR';

      // Error estructurado del backend (tu formato actual)
      if (error.error?.errors?.length > 0) {
        const backendError = error.error.errors[0];
        errorMessage = backendError.message;
        errorCode = backendError.code;
      }
      // Errores HTTP específicos para registro
      else if (error.status === 400) {
          errorMessage = 'Datos inválidos enviados';
          errorCode = 'INVALID_DATA';
      }
      else if (error.status === 401) {
          errorMessage = 'Credenciales inválidas';
          errorCode = 'INVALID_CREDENTIALS';
      }
      else if (error.status === 409) {
          errorMessage = 'El usuario ya existe';
          errorCode = 'USER_ALREADY_EXISTS';
      }
      else if (error.status === 422) {
          errorMessage = 'Error de validación';
          errorCode = 'VALIDATION_ERROR';
      }
      else if (error.status === 0) {
          errorMessage = 'Error de conexión';
          errorCode = 'NETWORK_ERROR';
      } 
      else if (error.status >= 500) {
          errorMessage = 'Error del servidor';
          errorCode = 'SERVER_ERROR';
      } 
      else if (error.error?.message) {
          errorMessage = error.error.message;
      }
      else if (error.message) {
          errorMessage = error.message;
      }

      const customError: CustomError = new Error(errorMessage) as CustomError;
      customError.code = errorCode;
      customError.status = error.status;
      customError.originalError = error;

      return throwError(() => customError);
  }
}
