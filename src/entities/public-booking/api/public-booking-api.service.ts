import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import {
  ClientAppointmentHistory,
  ClientProfile,
  ClientSettings,
  CompanyConfig,
  CreateMultiAppointmentDto,
  CreatePublicAppointmentDto,
  GalleryImage,
  MultiAppointmentResult,
  MultiAvailabilityQuery,
  NextAvailableDateResult,
  PublicAppointment,
  PublicCategory,
  PublicCompany,
  PublicProfessional,
  PublicService,
} from '../model/public-booking.model';

@Injectable({ providedIn: 'root' })
export class PublicBookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONSTANTS.apiBaseUrl}/public`;

  getCompanyBySlug(slug: string): Observable<ApiSuccessResponse<PublicCompany>> {
    return this.http
      .get<ApiSuccessResponse<PublicCompany>>(`${this.baseUrl}/${slug}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getServices(slug: string, search?: string, categoryId?: number): Observable<ApiSuccessResponse<PublicService[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId !== undefined) params = params.set('categoryId', categoryId.toString());

    return this.http
      .get<ApiSuccessResponse<PublicService[]>>(`${this.baseUrl}/${slug}/services`, { params })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getCategories(slug: string): Observable<ApiSuccessResponse<PublicCategory[]>> {
    return this.http
      .get<ApiSuccessResponse<PublicCategory[]>>(`${this.baseUrl}/${slug}/categories`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getProfessionals(slug: string): Observable<ApiSuccessResponse<PublicProfessional[]>> {
    return this.http
      .get<ApiSuccessResponse<PublicProfessional[]>>(`${this.baseUrl}/${slug}/professionals`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getProfessionalsByService(slug: string, serviceId: number): Observable<ApiSuccessResponse<PublicProfessional[]>> {
    return this.http
      .get<ApiSuccessResponse<PublicProfessional[]>>(`${this.baseUrl}/${slug}/professionals/service/${serviceId}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getAvailability(slug: string, date: string, professionalId?: number): Observable<ApiSuccessResponse<string[]>> {
    let params = new HttpParams().set('date', date);
    if (professionalId !== undefined) params = params.set('professionalId', professionalId.toString());

    return this.http
      .get<ApiSuccessResponse<string[]>>(`${this.baseUrl}/${slug}/availability`, { params })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createAppointment(slug: string, dto: CreatePublicAppointmentDto): Observable<ApiSuccessResponse<PublicAppointment>> {
    return this.http
      .post<ApiSuccessResponse<PublicAppointment>>(`${this.baseUrl}/${slug}/appointments`, dto)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getAppointmentByToken(token: string): Observable<ApiSuccessResponse<PublicAppointment>> {
    return this.http
      .get<ApiSuccessResponse<PublicAppointment>>(`${this.baseUrl}/appointments/${token}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  cancelAppointment(token: string): Observable<ApiSuccessResponse<PublicAppointment>> {
    return this.http
      .patch<ApiSuccessResponse<PublicAppointment>>(`${this.baseUrl}/appointments/${token}/cancel`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  confirmAppointment(token: string): Observable<ApiSuccessResponse<PublicAppointment>> {
    return this.http
      .patch<ApiSuccessResponse<PublicAppointment>>(`${this.baseUrl}/appointments/${token}/confirm`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getClientProfile(token: string): Observable<ApiSuccessResponse<ClientProfile>> {
    return this.http
      .get<ApiSuccessResponse<ClientProfile>>(`${this.baseUrl}/client/${token}/profile`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  updateClientProfile(token: string, data: Partial<ClientProfile>): Observable<ApiSuccessResponse<ClientProfile>> {
    return this.http
      .patch<ApiSuccessResponse<ClientProfile>>(`${this.baseUrl}/client/${token}/profile`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getClientAppointments(token: string): Observable<ApiSuccessResponse<ClientAppointmentHistory[]>> {
    return this.http
      .get<ApiSuccessResponse<ClientAppointmentHistory[]>>(`${this.baseUrl}/client/${token}/appointments`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  updateClientSettings(token: string, settings: ClientSettings): Observable<ApiSuccessResponse<ClientSettings>> {
    return this.http
      .patch<ApiSuccessResponse<ClientSettings>>(`${this.baseUrl}/client/${token}/settings`, settings)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  // ── Multi-booking endpoints ──

  getCompanyConfig(slug: string): Observable<ApiSuccessResponse<CompanyConfig>> {
    return this.http
      .get<ApiSuccessResponse<CompanyConfig>>(`${this.baseUrl}/${slug}/config`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getMultiAvailability(slug: string, query: MultiAvailabilityQuery): Observable<ApiSuccessResponse<string[]>> {
    return this.http
      .post<ApiSuccessResponse<string[]>>(`${this.baseUrl}/${slug}/availability/multi`, query)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getNextAvailableDate(slug: string, items: { ServiceId: number; ProfessionalId?: number | null }[]): Observable<ApiSuccessResponse<NextAvailableDateResult>> {
    const params = new HttpParams().set('items', JSON.stringify(items));
    return this.http
      .get<ApiSuccessResponse<NextAvailableDateResult>>(`${this.baseUrl}/${slug}/availability/next`, { params })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createMultiAppointment(slug: string, dto: CreateMultiAppointmentDto): Observable<ApiSuccessResponse<MultiAppointmentResult>> {
    return this.http
      .post<ApiSuccessResponse<MultiAppointmentResult>>(`${this.baseUrl}/${slug}/appointments/multi`, dto)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  getGallery(slug: string): Observable<ApiSuccessResponse<Record<string, GalleryImage[]>>> {
    return this.http
      .get<ApiSuccessResponse<Record<string, GalleryImage[]>>>(`${this.baseUrl}/${slug}/gallery`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos enviados';
      errorCode = 'INVALID_DATA';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado';
      errorCode = 'UNAUTHORIZED';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
      errorCode = 'NOT_FOUND';
    } else if (error.status === 409) {
      errorMessage = 'El registro ya existe';
      errorCode = 'ALREADY_EXISTS';
    } else if (error.status === 422) {
      errorMessage = 'Error de validación';
      errorCode = 'VALIDATION_ERROR';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión';
      errorCode = 'NETWORK_ERROR';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor';
      errorCode = 'SERVER_ERROR';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    customError.originalError = error;

    return throwError(() => customError);
  }
}
