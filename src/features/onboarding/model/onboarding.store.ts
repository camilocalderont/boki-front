import { Injectable, signal } from '@angular/core';
import type { SolerciaServiceType, Plan } from './onboarding.model';

@Injectable({ providedIn: 'root' })
export class OnboardingStore {
  private readonly _currentStep = signal<number>(1);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _onboardingToken = signal<string | null>(null);
  private readonly _email = signal<string>('');
  private readonly _serviceTypes = signal<SolerciaServiceType[]>([]);
  private readonly _plans = signal<Plan[]>([]);
  private readonly _selectedServiceTypeIds = signal<number[]>([]);
  private readonly _selectedPlanId = signal<number | null>(null);
  private readonly _billingCycle = signal<'monthly' | 'yearly'>('monthly');

  readonly currentStep = this._currentStep.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly onboardingToken = this._onboardingToken.asReadonly();
  readonly email = this._email.asReadonly();
  readonly serviceTypes = this._serviceTypes.asReadonly();
  readonly plans = this._plans.asReadonly();
  readonly selectedServiceTypeIds = this._selectedServiceTypeIds.asReadonly();
  readonly selectedPlanId = this._selectedPlanId.asReadonly();
  readonly billingCycle = this._billingCycle.asReadonly();

  setStep(step: number): void {
    this._currentStep.set(step);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
    this._loading.set(false);
  }

  setOnboardingToken(token: string): void {
    this._onboardingToken.set(token);
  }

  setEmail(email: string): void {
    this._email.set(email);
  }

  setServiceTypes(types: SolerciaServiceType[]): void {
    this._serviceTypes.set(types);
  }

  setPlans(plans: Plan[]): void {
    this._plans.set(plans);
  }

  toggleServiceType(id: number): void {
    this._selectedServiceTypeIds.update(ids => {
      const index = ids.indexOf(id);
      if (index === -1) return [...ids, id];
      return ids.filter(existing => existing !== id);
    });
  }

  setSelectedPlanId(id: number): void {
    this._selectedPlanId.set(id);
  }

  setBillingCycle(cycle: 'monthly' | 'yearly'): void {
    this._billingCycle.set(cycle);
  }

  reset(): void {
    this._currentStep.set(1);
    this._loading.set(false);
    this._error.set(null);
    this._onboardingToken.set(null);
    this._email.set('');
    this._serviceTypes.set([]);
    this._plans.set([]);
    this._selectedServiceTypeIds.set([]);
    this._selectedPlanId.set(null);
    this._billingCycle.set('monthly');
  }
}
