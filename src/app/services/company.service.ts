import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';
import { GetCompanyResponse, GetUserResponse, PostCompanyRequest } from '../shared/interfaces/company.interface';
import { GetCompanyPrompt, PostCompanyPrompt } from '../shared/interfaces/companny-prompt.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;
  
  constructor(private http: HttpClient) {
    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService inicializado:', this.baseUrl);
    }
  }

  getCompanies(): Observable<ApiSuccessResponse<GetCompanyResponse[]>> {
    const url = `${this.baseUrl}/companies`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - getCompanies:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCompanyResponse[]>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getCompanyById(id: number): Observable<ApiSuccessResponse<GetCompanyResponse>> {
    const url = `${this.baseUrl}/companies/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - getCompanyById:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCompanyResponse>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  postCompany(data: PostCompanyRequest): Observable<ApiSuccessResponse<GetCompanyResponse>> {
    const url = `${this.baseUrl}/companies`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - postCompany:', url, data);
    }

    return this.http.post<ApiSuccessResponse<GetCompanyResponse>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  putCompanyById(id: number, data: PostCompanyRequest): Observable<ApiSuccessResponse<GetCompanyResponse>> {
    const url = `${this.baseUrl}/companies/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - putCompanyById:', url);
    }

    return this.http.put<ApiSuccessResponse<GetCompanyResponse>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  //Se debe cambiar esta consulta para una que solo traiga el nombre y el Id de los usuarios registrados
  getUsers(): Observable<ApiSuccessResponse<GetUserResponse[]>> {
    const url = `${this.baseUrl}/users`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - getUsers:', url);
    }

    return this.http.get<ApiSuccessResponse<GetUserResponse[]>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getCompanyPrompts(): Observable<ApiSuccessResponse<GetCompanyPrompt[]>> {
    const url = `${this.baseUrl}/companyPrompts`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - getCompanyPrompts:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCompanyPrompt[]>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getCompanyPromptById(id: number): Observable<ApiSuccessResponse<GetCompanyPrompt>> {
    const url = `${this.baseUrl}/companyPrompts/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - getCompanyPromptById:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCompanyPrompt>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  postCompanyPrompt(data: PostCompanyPrompt): Observable<ApiSuccessResponse<GetCompanyPrompt>> {
    const url = `${this.baseUrl}/companyPrompts`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - postCompanyPrompt:', url, data);
    }

    return this.http.post<ApiSuccessResponse<GetCompanyPrompt>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  putCompanyPromptById(id: number, data: PostCompanyPrompt): Observable<ApiSuccessResponse<GetCompanyPrompt>> {
    const url = `${this.baseUrl}/companyPrompts/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CompanyService - putCompanyPromptById:', url);
    }

    return this.http.put<ApiSuccessResponse<GetCompanyPrompt>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'Error desconocido';
      let errorCode = 'UNKNOWN_ERROR';

      if (environment.enableDebugMode) {
          console.error('❌ Error de API:', error);
      }

      // Error estructurado del backend (tu formato actual)
      if (error.error?.errors?.length > 0) {
          const backendError = error.error.errors[0];
          errorMessage = backendError.message;
          errorCode = backendError.code;

          if (environment.enableDebugMode) {
              console.error('💥 Error del backend:', backendError);
          }
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
