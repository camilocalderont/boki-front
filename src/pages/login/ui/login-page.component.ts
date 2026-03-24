import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent, AuthApiService, AuthStore } from '@features/auth';
import { LoginCredentials } from '@entities/user';
import { ThemeService } from '@shared/tokens';

@Component({
  standalone: true,
  selector: 'bk-login-page',
  imports: [LoginFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-login-page">
      <div class="bk-login-page__container">
        @if (themeService.logo(); as logo) {
          <div class="bk-login-page__logo">
            <img [src]="logo.url" [alt]="logo.altText" class="bk-login-page__logo-img" />
          </div>
        }
        <div class="bk-login-page__header">
          <h1 class="bk-login-page__title">Iniciar Sesión</h1>
          <p class="bk-login-page__subtitle">Ingresa tus credenciales para acceder</p>
        </div>
        <bk-login-form
          [loading]="authStore.loading()"
          [error]="authStore.error()"
          (credentials)="onLogin($event)"
          (clearError)="authStore.setError(null)"
        />
      </div>
    </div>
  `,
  styles: [`
    .bk-login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bk-bg-page);
      padding: 24px;
    }

    .bk-login-page__container {
      width: 100%;
      max-width: 400px;
      background: var(--bk-bg-surface);
      border-radius: var(--bk-border-radius-lg);
      box-shadow: var(--bk-shadow-lg);
      padding: 32px;
    }

    .bk-login-page__logo {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .bk-login-page__logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .bk-login-page__header {
      text-align: center;
      margin-bottom: 24px;
    }

    .bk-login-page__title {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin: 0 0 4px 0;
    }

    .bk-login-page__subtitle {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted);
      margin: 0;
    }
  `],
})
export class LoginPageComponent {
  protected authStore = inject(AuthStore);
  protected themeService = inject(ThemeService);
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  onLogin(credentials: LoginCredentials): void {
    this.authApi.login(credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}
