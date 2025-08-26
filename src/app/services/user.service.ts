// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BackendLoginCredentials, BackendLoginResponse } from '../shared/interfaces/auth.interface';
import { CustomError } from '../shared/interfaces/api.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

    constructor(private http: HttpClient) {
        if (environment.enableDebugMode) {
            console.log('🔧 UserService inicializado:', this.baseUrl);
        }
    }

    /**
     * Login de usuario
     * POST /api/v1/users/login
     * Usa nombres exactos de tu backend
     */
    login(credentials: BackendLoginCredentials): Observable<BackendLoginResponse> {
        const url = `${this.baseUrl}/users/login`;

        if (environment.enableDebugMode) {
            console.log('📤 Enviando login:', { email: credentials.VcEmail });
        }

        return this.http.post<BackendLoginResponse>(url, credentials).pipe(
            tap(response => {
                if (environment.enableDebugMode) {
                    console.log('✅ Login exitoso:', {
                        status: response.status,
                        message: response.message,
                        userId: response.data.user.Id,
                        email: response.data.user.VcEmail,
                        hasToken: !!response.data.token
                    });
                }
            }),
            catchError(error => this.handleError(error))
        );
    }

    /**
     * Maneja errores de la API de manera centralizada
     */
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
        else if (error.status === 401) {
            errorMessage = 'Credenciales inválidas';
            errorCode = 'INVALID_CREDENTIALS';
        } else if (error.status === 0) {
            errorMessage = 'Error de conexión';
            errorCode = 'NETWORK_ERROR';
        } else if (error.status >= 500) {
            errorMessage = 'Error del servidor';
            errorCode = 'SERVER_ERROR';
        } else if (error.message) {
            errorMessage = error.message;
        }

        const customError: CustomError = new Error(errorMessage) as CustomError;
        customError.code = errorCode;
        customError.status = error.status;
        customError.originalError = error;

        return throwError(() => customError);
    }

    /**
     * Obtiene la URL base de la API 
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }
}