import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { BkInputComponent } from '@shared/ui';
import { BkButtonComponent } from '@shared/ui';
import type { OnboardingStep1Request } from '../model/onboarding.model';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasMinLength = value.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength
    ? null
    : { passwordStrength: true };
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('VcPassword')?.value;
  const confirmPassword = group.get('VcConfirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'bk-onboarding-step1',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bk-ob-step1">
      @if (error()) {
        <div class="bk-ob-step1__error" role="alert">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="bk-ob-step1__row">
        <bk-input
          label="Primer nombre *"
          placeholder="Ej: Juan"
          formControlName="VcFirstName"
          [error]="fieldError('VcFirstName', 'El primer nombre es requerido (mín. 2 caracteres)')"
        />
        <bk-input
          label="Segundo nombre"
          placeholder="Ej: Carlos"
          formControlName="VcSecondName"
        />
      </div>

      <div class="bk-ob-step1__row">
        <bk-input
          label="Primer apellido *"
          placeholder="Ej: García"
          formControlName="VcFirstLastName"
          [error]="fieldError('VcFirstLastName', 'El primer apellido es requerido (mín. 2 caracteres)')"
        />
        <bk-input
          label="Segundo apellido"
          placeholder="Ej: López"
          formControlName="VcSecondLastName"
        />
      </div>

      <bk-input
        label="Número de identificación *"
        placeholder="Ej: 1234567890"
        formControlName="VcIdentificationNumber"
        [error]="fieldError('VcIdentificationNumber', 'El número de identificación es requerido (mín. 5 caracteres)')"
      />

      <bk-input
        label="Teléfono *"
        type="tel"
        placeholder="Ej: 3001234567"
        formControlName="VcPhone"
        [error]="fieldError('VcPhone', 'Ingresa un teléfono válido (ej: 3001234567)')"
      />

      <bk-input
        label="Correo electrónico *"
        type="email"
        placeholder="correo@ejemplo.com"
        formControlName="VcEmail"
        [disabled]="true"
      />

      <bk-input
        label="Contraseña *"
        type="password"
        placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
        formControlName="VcPassword"
        [error]="passwordError()"
      />

      <bk-input
        label="Confirmar contraseña *"
        type="password"
        placeholder="Repetí tu contraseña"
        formControlName="VcConfirmPassword"
        [error]="confirmPasswordError()"
      />

      <div class="bk-ob-step1__actions">
        <bk-button
          type="submit"
          variant="primary"
          size="lg"
          [loading]="loading()"
        >
          Continuar
        </bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-ob-step1 {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      width: 100%;
    }

    .bk-ob-step1__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--bk-space-md, 1rem);
    }

    @media (max-width: 480px) {
      .bk-ob-step1__row {
        grid-template-columns: 1fr;
      }
    }

    .bk-ob-step1__error {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .bk-ob-step1__actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--bk-space-sm, 0.5rem);
    }

    :host ::ng-deep .bk-ob-step1__actions bk-button,
    :host ::ng-deep .bk-ob-step1__actions bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class OnboardingStep1Component implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly prefillEmail = input<string>('');

  readonly submitted = output<OnboardingStep1Request>();

  readonly form: FormGroup = this.fb.group(
    {
      VcFirstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      VcSecondName: [''],
      VcFirstLastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      VcSecondLastName: [''],
      VcIdentificationNumber: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      VcPhone: ['', [Validators.required, Validators.pattern(/^(3|6)\d{9}$/)]],
      VcEmail: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      VcPassword: ['', [Validators.required, passwordStrengthValidator]],
      VcConfirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    effect(() => {
      const email = this.prefillEmail();
      if (email) {
        this.form.get('VcEmail')?.setValue(email);
      }
    });
  }

  ngOnInit(): void {
    const email = this.prefillEmail();
    if (email) {
      this.form.get('VcEmail')?.setValue(email);
    }
  }

  fieldError(fieldName: string, message: string): string {
    const control = this.form.get(fieldName);
    return control?.touched && control?.invalid ? message : '';
  }

  passwordError(): string {
    const control = this.form.get('VcPassword');
    if (!control?.touched || control.valid) return '';
    if (control.hasError('required')) return 'La contraseña es requerida';
    if (control.hasError('passwordStrength')) {
      return 'Mín. 8 caracteres, una mayúscula, una minúscula y un número';
    }
    return '';
  }

  confirmPasswordError(): string {
    const control = this.form.get('VcConfirmPassword');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'Confirma tu contraseña';
    if (this.form.hasError('passwordMismatch')) return 'Las contraseñas no coinciden';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const { VcConfirmPassword, ...rest } = rawValue;

    this.submitted.emit(rest as OnboardingStep1Request);
  }
}
