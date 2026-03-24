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
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { BkInputComponent, BkButtonComponent } from '@shared/ui';
import { RegisterCredentials } from '@entities/user';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasMinLength = value.length >= 8;

  const valid = hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
  return valid ? null : { passwordStrength: true };
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'bk-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bk-register-form">
      @if (error()) {
        <div class="bk-register-form__error" role="alert">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="bk-register-form__row">
        <bk-input
          label="Primer nombre"
          placeholder="Ej: Juan"
          formControlName="firstName"
          [error]="fieldError('firstName', 'Primer nombre es requerido')"
        />
        <bk-input
          label="Segundo nombre"
          placeholder="Ej: Carlos"
          formControlName="secondName"
        />
      </div>

      <div class="bk-register-form__row">
        <bk-input
          label="Primer apellido"
          placeholder="Ej: Garcia"
          formControlName="firstLastName"
          [error]="fieldError('firstLastName', 'Primer apellido es requerido')"
        />
        <bk-input
          label="Segundo apellido"
          placeholder="Ej: Lopez"
          formControlName="secondLastName"
        />
      </div>

      <bk-input
        label="Nombre de usuario"
        placeholder="Ej: juangarcia"
        formControlName="nickName"
        [error]="fieldError('nickName', 'Nombre de usuario es requerido')"
      />

      <div class="bk-register-form__row">
        <bk-input
          label="Numero de identificacion"
          placeholder="Ej: 1234567890"
          formControlName="identificationNumber"
          [error]="fieldError('identificationNumber', 'Numero de identificacion es requerido')"
        />
        <bk-input
          label="Telefono"
          type="tel"
          placeholder="Ej: 3001234567"
          formControlName="phone"
          [error]="fieldError('phone', 'Telefono es requerido')"
        />
      </div>

      <bk-input
        label="Correo electronico"
        type="email"
        placeholder="correo@ejemplo.com"
        formControlName="email"
        [error]="fieldError('email', 'Ingrese un correo valido')"
      />

      <bk-input
        label="Contrasena"
        type="password"
        placeholder="Minimo 8 caracteres, mayuscula, minuscula y numero"
        formControlName="password"
        [error]="passwordError()"
      />

      <bk-input
        label="Confirmar contrasena"
        type="password"
        placeholder="Repita su contrasena"
        formControlName="confirmPassword"
        [error]="confirmPasswordError()"
      />

      <bk-button
        type="submit"
        variant="primary"
        size="lg"
        [disabled]="form.invalid"
        [loading]="loading()"
      >
        Registrarse
      </bk-button>
    </form>
  `,
  styles: `
    .bk-register-form {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      width: 100%;
    }

    .bk-register-form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--bk-space-md, 1rem);
    }

    @media (max-width: 480px) {
      .bk-register-form__row {
        grid-template-columns: 1fr;
      }
    }

    .bk-register-form__error {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    :host ::ng-deep bk-button {
      width: 100%;
    }

    :host ::ng-deep bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly credentials = output<RegisterCredentials>();

  readonly form: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      secondName: [''],
      firstLastName: ['', [Validators.required]],
      secondLastName: [''],
      nickName: ['', [Validators.required]],
      identificationNumber: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  fieldError(fieldName: string, message: string): string {
    const control = this.form.get(fieldName);
    return control?.touched && control?.invalid ? message : '';
  }

  passwordError(): string {
    const control = this.form.get('password');
    if (!control?.touched || control.valid) return '';
    if (control.hasError('required')) return 'La contrasena es requerida';
    if (control.hasError('passwordStrength')) {
      return 'Minimo 8 caracteres, una mayuscula, una minuscula y un numero';
    }
    return '';
  }

  confirmPasswordError(): string {
    const control = this.form.get('confirmPassword');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'Confirme su contrasena';
    if (this.form.hasError('passwordMismatch')) return 'Las contrasenas no coinciden';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.credentials.emit(this.form.value as RegisterCredentials);
  }
}
