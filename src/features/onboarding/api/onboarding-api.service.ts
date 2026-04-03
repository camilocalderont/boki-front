import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';
import type {
  OnboardingInitiateRequest,
  OnboardingInitiateResponse,
  OnboardingValidateResponse,
  OnboardingStep1Request,
  OnboardingStep1Response,
  OnboardingStep2Request,
  OnboardingStep3Request,
  OnboardingStep4Request,
  SolerciaServiceType,
  Plan,
} from '../model/onboarding.model';

@Injectable({ providedIn: 'root' })
export class OnboardingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONSTANTS.apiBaseUrl}/onboarding`;

  initiate(dto: OnboardingInitiateRequest): Observable<OnboardingInitiateResponse> {
    return this.http.post<OnboardingInitiateResponse>(`${this.baseUrl}/initiate`, dto);
  }

  validateToken(token: string): Observable<OnboardingValidateResponse> {
    return this.http.get<OnboardingValidateResponse>(`${this.baseUrl}/validate/${token}`);
  }

  processStep1(token: string, dto: OnboardingStep1Request): Observable<OnboardingStep1Response> {
    return this.http.post<OnboardingStep1Response>(`${this.baseUrl}/step/1/${token}`, dto);
  }

  processStep2(token: string, dto: OnboardingStep2Request): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/step/2/${token}`, dto);
  }

  processStep3(token: string, dto: OnboardingStep3Request): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/step/3/${token}`, dto);
  }

  processStep4(token: string, dto: OnboardingStep4Request): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/step/4/${token}`, dto);
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${APP_CONSTANTS.apiBaseUrl}/plans`);
  }

  getServiceTypes(): Observable<SolerciaServiceType[]> {
    return this.http.get<SolerciaServiceType[]>(`${APP_CONSTANTS.apiBaseUrl}/solercia-service-types`);
  }
}
