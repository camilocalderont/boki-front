import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OnboardingApiService } from '@features/onboarding';
import { BkInputComponent, BkButtonComponent } from '@shared/ui';
import { ROUTES } from '@shared/config/route.constants';

@Component({
  standalone: true,
  selector: 'bk-onboarding-start-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkInputComponent, BkButtonComponent, RouterLink, FormsModule],
  template: `
    <div class="bk-onboarding-start">
      <div class="bk-onboarding-start__card">

        <div class="bk-onboarding-start__brand">
          <span class="bk-onboarding-start__brand-icon">🤖</span>
          <span class="bk-onboarding-start__brand-name">BokiBot</span>
        </div>

        <div class="bk-onboarding-start__header">
          <h1 class="bk-onboarding-start__title">Empieza a usar BokiBot</h1>
          <p class="bk-onboarding-start__subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para completar tu registro.
          </p>
        </div>

        @if (success()) {
          <div class="bk-onboarding-start__success">
            <span class="bk-onboarding-start__success-icon">✅</span>
            <p class="bk-onboarding-start__success-text">
              ¡Revisa tu correo! Te enviamos un enlace para continuar.
            </p>
          </div>
        } @else {
          <div class="bk-onboarding-start__form">
            <bk-input
              type="email"
              label="Correo electrónico"
              placeholder="tu@correo.com"
              [error]="error() ?? ''"
              [disabled]="loading()"
              [(ngModel)]="emailValue"
              name="email"
            />

            @if (error()) {
              <p class="bk-onboarding-start__error">{{ error() }}</p>
            }

            <bk-button
              variant="primary"
              size="lg"
              [loading]="loading()"
              (clicked)="onSubmit()"
            >
              Enviar enlace
            </bk-button>
          </div>
        }

        <div class="bk-onboarding-start__footer">
          <a [routerLink]="['/', ROUTES.AUTH.LOGIN]" class="bk-onboarding-start__login-link">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .bk-onboarding-start {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bk-bg-page);
      padding: 24px;
    }

    .bk-onboarding-start__card {
      width: 100%;
      max-width: 480px;
      background: var(--bk-bg-surface);
      border-radius: var(--bk-border-radius-lg);
      box-shadow: var(--bk-shadow-lg);
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .bk-onboarding-start__brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .bk-onboarding-start__brand-icon {
      font-size: 28px;
    }

    .bk-onboarding-start__brand-name {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 700;
      color: var(--bk-color-primary);
      letter-spacing: -0.02em;
    }

    .bk-onboarding-start__header {
      text-align: center;
    }

    .bk-onboarding-start__title {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin: 0 0 8px 0;
    }

    .bk-onboarding-start__subtitle {
      font-size: var(--bk-font-size-sm, 13px);
      color: var(--bk-color-text-muted);
      margin: 0;
      line-height: 1.5;
    }

    .bk-onboarding-start__success {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
      background: color-mix(in srgb, var(--bk-color-success, #22c55e) 10%, transparent);
      border-radius: var(--bk-border-radius-md);
      text-align: center;
    }

    .bk-onboarding-start__success-icon {
      font-size: 32px;
    }

    .bk-onboarding-start__success-text {
      font-size: var(--bk-font-size-base, 14px);
      color: var(--bk-color-text-primary);
      margin: 0;
      line-height: 1.5;
    }

    .bk-onboarding-start__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bk-onboarding-start__form bk-button {
      display: block;
      width: 100%;
    }

    .bk-onboarding-start__form bk-button ::ng-deep button {
      width: 100%;
    }

    .bk-onboarding-start__error {
      font-size: var(--bk-font-size-sm, 13px);
      color: var(--bk-color-danger);
      margin: 0;
    }

    .bk-onboarding-start__footer {
      text-align: center;
    }

    .bk-onboarding-start__login-link {
      font-size: var(--bk-font-size-sm, 13px);
      color: var(--bk-color-primary);
      text-decoration: none;
    }

    .bk-onboarding-start__login-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 520px) {
      .bk-onboarding-start__card {
        padding: 28px 20px;
      }
    }
  `],
})
export class OnboardingStartPageComponent {
  protected readonly ROUTES = ROUTES;

  emailValue = '';
  readonly email = signal('');
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  private readonly onboardingApi = inject(OnboardingApiService);

  onSubmit(): void {
    if (!this.emailValue || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.onboardingApi.initiate({ VcEmail: this.emailValue }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mapError(err));
        this.loading.set(false);
      },
    });
  }

  private mapError(error: HttpErrorResponse): string {
    if (error.error?.errors?.[0]?.message) return error.error.errors[0].message;
    if (error.status === 409) return 'Ya existe un registro con este correo.';
    if (error.status === 404) return 'No se encontró el recurso solicitado.';
    if (error.status === 0) return 'Error de conexión. Verifica tu internet.';
    return 'Ocurrió un error. Intenta de nuevo.';
  }
}
