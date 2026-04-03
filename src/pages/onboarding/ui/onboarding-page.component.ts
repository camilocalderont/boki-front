import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import {
  OnboardingApiService,
  OnboardingStore,
  OnboardingStepIndicatorComponent,
  OnboardingStep1Component,
  OnboardingStep2Component,
  OnboardingStep3Component,
  OnboardingStep4Component,
  OnboardingStep1Request,
  OnboardingStep2Request,
  OnboardingStep3Request,
  OnboardingStep4Request,
} from '@features/onboarding';
import { AuthStore } from '@features/auth';

@Component({
  standalone: true,
  selector: 'bk-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnboardingStepIndicatorComponent,
    OnboardingStep1Component,
    OnboardingStep2Component,
    OnboardingStep3Component,
    OnboardingStep4Component,
  ],
  template: `
    <div class="bk-onboarding">

      <div class="bk-onboarding__header">
        <span class="bk-onboarding__brand-icon">🤖</span>
        <h1 class="bk-onboarding__brand-name">BokiBot</h1>
      </div>

      <div class="bk-onboarding__content">
        <bk-onboarding-step-indicator [currentStep]="store.currentStep()" />

        @if (store.currentStep() === 1) {
          <bk-onboarding-step1
            [loading]="store.loading()"
            [error]="store.error()"
            [prefillEmail]="store.email()"
            (submitted)="onStep1Submit($event)"
          />
        }

        @if (store.currentStep() === 2) {
          <bk-onboarding-step2
            [loading]="store.loading()"
            [error]="store.error()"
            (submitted)="onStep2Submit($event)"
            (back)="goBack()"
          />
        }

        @if (store.currentStep() === 3) {
          <bk-onboarding-step3
            [loading]="store.loading()"
            [error]="store.error()"
            [serviceTypes]="store.serviceTypes()"
            (submitted)="onStep3Submit($event)"
            (back)="goBack()"
          />
        }

        @if (store.currentStep() === 4) {
          <bk-onboarding-step4
            [loading]="store.loading()"
            [error]="store.error()"
            [plans]="store.plans()"
            (submitted)="onStep4Submit($event)"
            (back)="goBack()"
          />
        }
      </div>

    </div>
  `,
  styles: [`
    .bk-onboarding {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      background: var(--bk-bg-page);
      padding: 32px 24px;
    }

    .bk-onboarding__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
    }

    .bk-onboarding__brand-icon {
      font-size: 28px;
    }

    .bk-onboarding__brand-name {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 700;
      color: var(--bk-color-primary);
      letter-spacing: -0.02em;
      margin: 0;
    }

    .bk-onboarding__content {
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (max-width: 840px) {
      .bk-onboarding {
        padding: 20px 16px;
      }
    }
  `],
})
export class OnboardingPageComponent implements OnInit {
  protected readonly store = inject(OnboardingStore);
  private readonly onboardingApi = inject(OnboardingApiService);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.router.navigate(['/auth/onboarding/start']);
      return;
    }

    this.store.setLoading(true);
    this.store.setError(null);

    this.onboardingApi.validateToken(token).subscribe({
      next: (response: any) => {
        const data = response.data ?? response;
        this.store.setOnboardingToken(token);
        if (data.VcEmail) this.store.setEmail(data.VcEmail);
        if (data.ICurrentStep) this.store.setStep(data.ICurrentStep);

        forkJoin([
          this.onboardingApi.getServiceTypes(),
          this.onboardingApi.getPlans(),
        ]).subscribe({
          next: ([serviceTypesRes, plansRes]: any[]) => {
            this.store.setServiceTypes(serviceTypesRes.data ?? serviceTypesRes);
            this.store.setPlans(plansRes.data ?? plansRes);
            this.store.setLoading(false);
          },
          error: () => {
            this.store.setLoading(false);
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.store.setLoading(false);
        this.store.setError(this.mapError(err));
        this.router.navigate(['/auth/onboarding/start']);
      },
    });
  }

  onStep1Submit(dto: OnboardingStep1Request): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.onboardingApi.processStep1(this.store.onboardingToken()!, dto).subscribe({
      next: (response: any) => {
        const data = response.data ?? response;
        if (data.token) {
          this.authStore.handleLoginSuccess(data.token, data.user);
        }
        this.store.setStep(2);
        this.store.setLoading(false);
      },
      error: (err: HttpErrorResponse) => {
        this.store.setError(this.mapError(err));
        this.store.setLoading(false);
      },
    });
  }

  onStep2Submit(dto: OnboardingStep2Request): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.onboardingApi.processStep2(this.store.onboardingToken()!, dto).subscribe({
      next: () => {
        this.store.setStep(3);
        this.store.setLoading(false);
      },
      error: (err: HttpErrorResponse) => {
        this.store.setError(this.mapError(err));
        this.store.setLoading(false);
      },
    });
  }

  onStep3Submit(dto: OnboardingStep3Request): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.onboardingApi.processStep3(this.store.onboardingToken()!, dto).subscribe({
      next: () => {
        this.store.setStep(4);
        this.store.setLoading(false);
      },
      error: (err: HttpErrorResponse) => {
        this.store.setError(this.mapError(err));
        this.store.setLoading(false);
      },
    });
  }

  onStep4Submit(dto: OnboardingStep4Request): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.onboardingApi.processStep4(this.store.onboardingToken()!, dto).subscribe({
      next: () => {
        this.store.setLoading(false);
        this.store.reset();
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.store.setError(this.mapError(err));
        this.store.setLoading(false);
      },
    });
  }

  goBack(): void {
    const current = this.store.currentStep();
    if (current > 1) {
      this.store.setStep(current - 1);
      this.store.setError(null);
    }
  }

  private mapError(error: HttpErrorResponse): string {
    if (error.error?.errors?.[0]?.message) return error.error.errors[0].message;
    if (error.status === 409) return 'Ya existe un registro con estos datos.';
    if (error.status === 404) return 'Token inválido o expirado.';
    if (error.status === 0) return 'Error de conexión. Verificá tu internet.';
    return 'Ocurrió un error. Intentá de nuevo.';
  }
}
