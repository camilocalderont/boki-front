import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BkInputComponent, BkButtonComponent } from '@shared/ui';
import { LoginCredentials } from '@entities/user';

@Component({
  selector: 'bk-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bk-login-form">
      @if (error()) {
        <div class="bk-login-form__error" role="alert">
          <span>{{ error() }}</span>
          <button
            type="button"
            class="bk-login-form__error-close"
            (click)="clearError.emit()"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
      }

      <bk-input
        label="Correo electronico"
        type="email"
        placeholder="correo@ejemplo.com"
        formControlName="email"
        [error]="form.get('email')?.touched && form.get('email')?.invalid ? 'Ingrese un correo valido' : ''"
      />

      <bk-input
        label="Contrasena"
        type="password"
        placeholder="Ingrese su contrasena"
        formControlName="password"
        [error]="form.get('password')?.touched && form.get('password')?.invalid ? 'La contrasena es requerida' : ''"
      />

      <bk-button
        type="submit"
        variant="primary"
        size="lg"
        [disabled]="form.invalid"
        [loading]="loading()"
      >
        Iniciar sesion
      </bk-button>
    </form>
  `,
  styles: `
    .bk-login-form {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      width: 100%;
    }

    .bk-login-form__error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .bk-login-form__error-close {
      background: none;
      border: none;
      color: var(--bk-color-danger, #ef4444);
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0;
      margin-left: var(--bk-space-sm, 0.5rem);
    }

    :host ::ng-deep bk-button {
      width: 100%;
    }

    :host ::ng-deep bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly credentials = output<LoginCredentials>();
  readonly clearError = output<void>();

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.credentials.emit({
      email: this.form.value.email,
      password: this.form.value.password,
    });
  }
}
