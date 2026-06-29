import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Client, CreateClientRequest } from '../model/client.model';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/clients`;

  search(companyId: number, query: string): Observable<ApiSuccessResponse<Client[]>> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('q', query);

    return this.http
      .get<ApiSuccessResponse<Client[]>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  create(data: CreateClientRequest): Observable<ApiSuccessResponse<Client>> {
    return this.http
      .post<ApiSuccessResponse<Client>>(this.baseUrl, data)
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
