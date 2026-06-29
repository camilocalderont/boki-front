import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { Appointment, AppointmentState, AvailableSlots, CreateAppointmentRequest, UpdateAppointmentRequest, ChangeStateRequest } from '../model/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/appointments`;

  getAll(): Observable<ApiSuccessResponse<Appointment[]>> {
    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .get<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getByCompany(companyId: number, startDate?: string, endDate?: string, status?: number): Observable<ApiSuccessResponse<Appointment[]>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status) params = params.set('status', status.toString());

    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(`${this.baseUrl}/by-company/${companyId}`, { params })
      .pipe(catchError(this.handleError));
  }

  getAllStates(): Observable<ApiSuccessResponse<AppointmentState[]>> {
    return this.http
      .get<ApiSuccessResponse<AppointmentState[]>>(`${this.baseUrl}/states`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateAppointmentRequest): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .post<ApiSuccessResponse<Appointment>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: UpdateAppointmentRequest): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .put<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  changeState(id: number, data: ChangeStateRequest): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .patch<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/${id}/state`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http
      .delete<ApiSuccessResponse<void>>(`${this.baseUrl}/${id}`)
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
