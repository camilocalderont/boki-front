import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';
import { Appointment, AvailableSlots, CreateAppointmentRequest } from '../shared/interfaces/appointment.interface';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  getByCompany(
    companyId: number,
    startDate?: string,
    endDate?: string,
    status?: string
  ): Observable<ApiSuccessResponse<Appointment[]>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status) params = params.set('status', status);

    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(
        `${this.baseUrl}/appointments/by-company/${companyId}`,
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  getAll(): Observable<ApiSuccessResponse<Appointment[]>> {
    return this.http
      .get<ApiSuccessResponse<Appointment[]>>(`${this.baseUrl}/appointments`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .get<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/appointments/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateAppointmentRequest): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .post<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/appointments`, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<Appointment>): Observable<ApiSuccessResponse<Appointment>> {
    return this.http
      .put<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/appointments/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  getAvailableSlots(
    professionalId: number,
    serviceId: number,
    date: string
  ): Observable<ApiSuccessResponse<AvailableSlots>> {
    const params = new HttpParams()
      .set('serviceId', serviceId.toString())
      .set('date', date);

    return this.http
      .get<ApiSuccessResponse<AvailableSlots>>(
        `${this.baseUrl}/professional/${professionalId}/available-slots`,
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión';
      errorCode = 'NETWORK_ERROR';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor';
      errorCode = 'SERVER_ERROR';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    customError.originalError = error;

    return throwError(() => customError);
  }
}
