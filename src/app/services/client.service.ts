import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';
import { Client, CreateClientRequest } from '../shared/interfaces/client.interface';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  search(query: string, companyId: number): Observable<ApiSuccessResponse<Client[]>> {
    const params = new HttpParams()
      .set('q', query)
      .set('companyId', companyId.toString());

    return this.http
      .get<ApiSuccessResponse<Client[]>>(`${this.baseUrl}/clients/search`, { params })
      .pipe(catchError(this.handleError));
  }

  create(data: CreateClientRequest): Observable<ApiSuccessResponse<Client>> {
    return this.http
      .post<ApiSuccessResponse<Client>>(`${this.baseUrl}/clients`, data)
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
