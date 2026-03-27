import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Professional, CreateProfessionalRequest, ProfessionalBussinessHour } from '../model/professional.model';

@Injectable({ providedIn: 'root' })
export class ProfessionalApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/professional`;

  getAll(): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  getByService(serviceId: number): Observable<ApiSuccessResponse<Professional[]>> {
    return this.http
      .get<ApiSuccessResponse<Professional[]>>(`${this.baseUrl}/service/${serviceId}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateProfessionalRequest): Observable<ApiSuccessResponse<Professional>> {
    return this.http
      .post<ApiSuccessResponse<Professional>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<CreateProfessionalRequest>): Observable<ApiSuccessResponse<Professional>> {
    return this.http
      .put<ApiSuccessResponse<Professional>>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http
      .delete<ApiSuccessResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getBusinessHours(professionalId: number): Observable<ApiSuccessResponse<ProfessionalBussinessHour[]>> {
    return this.http
      .get<ApiSuccessResponse<ProfessionalBussinessHour[]>>(`${this.baseUrl}/${professionalId}/business-hours`)
      .pipe(catchError(this.handleError));
  }

  updateBusinessHours(
    professionalId: number,
    hours: Omit<ProfessionalBussinessHour, 'Id' | 'ProfessionalId' | 'CompanyBranchRoom'>[],
  ): Observable<ApiSuccessResponse<ProfessionalBussinessHour[]>> {
    return this.http
      .put<ApiSuccessResponse<ProfessionalBussinessHour[]>>(
        `${this.baseUrl}/${professionalId}/business-hours`,
        { BussinessHours: hours },
      )
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
