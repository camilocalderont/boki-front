import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';
import { GetCategoryResponse, PostCategoryRequest } from '../shared/interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;
  
  constructor(private http: HttpClient) {
    if (environment.enableDebugMode) {
      console.log('🔧 CategoryService inicializado:', this.baseUrl);
    }
  }

  getCategories(): Observable<ApiSuccessResponse<GetCategoryResponse[]>> {
    const url = `${this.baseUrl}/category-services`;

    if (environment.enableDebugMode) {
      console.log('🔧 CategoryService - getCategories:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCategoryResponse[]>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getCategoryById(id: number): Observable<ApiSuccessResponse<GetCategoryResponse>> {
    const url = `${this.baseUrl}/category-services/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CategoryService - getCategoryById:', url);
    }

    return this.http.get<ApiSuccessResponse<GetCategoryResponse>>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  postCategory(data: PostCategoryRequest): Observable<ApiSuccessResponse<GetCategoryResponse>> {
    const url = `${this.baseUrl}/category-services`;

    if (environment.enableDebugMode) {
      console.log('🔧 CategoryService - postCategory:', url);
    }

    return this.http.post<ApiSuccessResponse<GetCategoryResponse>>(url, data).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  putCategoryById(id: number, data: PostCategoryRequest): Observable<ApiSuccessResponse<GetCategoryResponse>> {
    const url = `${this.baseUrl}/category-services/${id}`;

    if (environment.enableDebugMode) {
      console.log('🔧 CategoryService - putCategoryById:', url);
    }

    return this.http.put<ApiSuccessResponse<GetCategoryResponse>>(url, data).pipe(
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
