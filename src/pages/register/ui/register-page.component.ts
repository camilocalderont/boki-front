import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterFormComponent, AuthApiService, AuthStore } from '@features/auth';
import { RegisterCredentials } from '@entities/user';

@Component({
  standalone: true,
  selector: 'bk-register-page',
  imports: [RegisterFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-register-page">
      <div class="bk-register-page__container">
        <div class="bk-register-page__header">
          <h1 class="bk-register-page__title">Crear Cuenta</h1>
          <p class="bk-register-page__subtitle">Completa tus datos para registrarte</p>
        </div>
        <bk-register-form
          [loading]="authStore.loading()"
          [error]="authStore.error()"
          (credentials)="onRegister($event)"
          (clearError)="authStore.setError(null)"
        />
      </div>
    </div>
  `,
  styles: [`
    .bk-register-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bk-bg-page); padding: var(--bk-space-lg); }
    .bk-register-page__container { width: 100%; max-width: 420px; background: var(--bk-bg-surface); border-radius: var(--bk-border-radius-lg); box-shadow: var(--bk-shadow-lg); padding: var(--bk-space-xl); }
    .bk-register-page__header { text-align: center; margin-bottom: var(--bk-space-lg); }
    .bk-register-page__title { font-size: var(--bk-font-size-xl); font-weight: var(--bk-font-weight-bold); color: var(--bk-color-text-primary); margin-bottom: var(--bk-space-xs); }
    .bk-register-page__subtitle { font-size: var(--bk-font-size-sm); color: var(--bk-color-text-muted); }
  `],
})
export class RegisterPageComponent {
  protected authStore = inject(AuthStore);
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  onRegister(credentials: RegisterCredentials): void {
    this.authApi.register(credentials).subscribe({
      next: () => this.router.navigate(['/login']),
    });
  }
}
