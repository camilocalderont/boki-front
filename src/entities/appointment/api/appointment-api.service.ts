import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Appointment, AvailableSlots, CreateAppointmentRequest } from '../model/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/appointments`;

  getAll(): Observable<ApiSuccessResponse<Appointment[]>> {
    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<Appointment[]>> {
    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(`${this.baseUrl}/company/${companyId}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateAppointmentRequest): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .post<ApiSuccessResponse<Appointment>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  getAvailableSlots(professionalId: number, date: string, serviceId: number): Observable<ApiSuccessResponse<AvailableSlots>> {
    const params = new HttpParams()
      .set('professionalId', professionalId.toString())
      .set('date', date)
      .set('serviceId', serviceId.toString());

    return this.http
      .get<ApiSuccessResponse<AvailableSlots>>(`${this.baseUrl}/available-slots`, { params })
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
