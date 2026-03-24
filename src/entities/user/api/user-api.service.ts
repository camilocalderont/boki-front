import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';
import { CustomError } from '@shared/api';
import {
  BackendLoginCredentials,
  BackendLoginResponse,
  BackendRegisterCredentials,
  BackendRegisterResponse,
} from './user.dto';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseUrl = APP_CONSTANTS.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  login(credentials: BackendLoginCredentials): Observable<BackendLoginResponse> {
    return this.http
      .post<BackendLoginResponse>(`${this.baseUrl}/users/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  register(userData: BackendRegisterCredentials): Observable<BackendRegisterResponse> {
    return this.http
      .post<BackendRegisterResponse>(`${this.baseUrl}/users`, userData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: unknown): Observable<never> {
    const customError: CustomError = Object.assign(new Error('Error en la petición'), {
      code: 'API_ERROR',
      originalError: error,
    });

    return throwError(() => customError);
  }
}
