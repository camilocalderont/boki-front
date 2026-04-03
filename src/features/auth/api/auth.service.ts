import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';
import { LoginCredentials, RegisterCredentials } from '@entities/user';
import {
  BackendLoginResponse,
  BackendRegisterResponse,
} from '../../../entities/user/api/user.dto';
import { AuthStore } from '../model/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);
  private readonly baseUrl = `${APP_CONSTANTS.apiBaseUrl}/users`;

  login(credentials: LoginCredentials): Observable<BackendLoginResponse> {
    this.authStore.setLoading(true);

    return this.http
      .post<BackendLoginResponse>(`${this.baseUrl}/login`, {
        VcEmail: credentials.email.trim().toLowerCase(),
        VcPassword: credentials.password,
      })
      .pipe(
        tap(response => {
          this.authStore.handleLoginSuccess(
            response.data.token,
            response.data.user,
            response.data.roles,
          );
        }),
        catchError(error => {
          this.authStore.setError(this.mapError(error));
          return throwError(() => error);
        }),
      );
  }

  register(credentials: RegisterCredentials): Observable<BackendRegisterResponse> {
    this.authStore.setLoading(true);

    return this.http
      .post<BackendRegisterResponse>(this.baseUrl, {
        VcIdentificationNumber: credentials.identificationNumber.trim(),
        VcPhone: credentials.phone.trim(),
        vcNickName: credentials.nickName.trim(),
        VcFirstName: credentials.firstName.trim(),
        VcSecondName: credentials.secondName?.trim() || '',
        VcFirstLastName: credentials.firstLastName.trim(),
        VcSecondLastName: credentials.secondLastName?.trim() || '',
        VcEmail: credentials.email.trim().toLowerCase(),
        VcPassword: credentials.password,
      })
      .pipe(
        tap(() => this.authStore.setLoading(false)),
        catchError(error => {
          this.authStore.setError(this.mapError(error));
          return throwError(() => error);
        }),
      );
  }

  private mapError(error: HttpErrorResponse): string {
    if (error.error?.errors?.length > 0) {
      return error.error.errors[0].message;
    }
    if (error.status === 401) return 'Credenciales invalidas';
    if (error.status === 409) return 'El usuario ya existe';
    if (error.status === 0) return 'Error de conexion';
    if (error.status >= 500) return 'Error del servidor';
    return error.error?.message ?? 'Error desconocido';
  }
}
