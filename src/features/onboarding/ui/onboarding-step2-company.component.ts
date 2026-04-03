import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BkInputComponent } from '@shared/ui';
import { BkButtonComponent } from '@shared/ui';
import type { OnboardingStep2Request } from '../model/onboarding.model';

@Component({
  selector: 'bk-onboarding-step2',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bk-ob-step2">
      <button type="button" class="bk-ob-step2__back" (click)="back.emit()">← Volver al paso anterior</button>

      @if (error()) {
        <div class="bk-ob-step2__error" role="alert">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="bk-ob-step2__row">
        <bk-input
          label="Nombre de tu negocio *"
          placeholder="Ej: Estética Valentina"
          formControlName="VcName"
          [error]="fieldError('VcName', 'El nombre del negocio es requerido (mín. 3 caracteres)')"
        />
        <bk-input
          label="Email del negocio *"
          type="email"
          placeholder="negocio@ejemplo.com"
          formControlName="VcPrincipalEmail"
          [error]="fieldError('VcPrincipalEmail', 'Ingresá un email válido')"
        />
      </div>

      <div class="bk-ob-step2__row">
        <bk-input
          label="Teléfono"
          type="tel"
          placeholder="Ej: 3001234567"
          formControlName="VcPhone"
        />
        <bk-input
          label="Dirección"
          placeholder="Ej: Cra. 15 #93-47, Bogotá"
          formControlName="VcPrincipalAddress"
        />
      </div>

      <bk-input
        label="Descripción breve"
        placeholder="Ej: Centro de estética especializado en tratamientos faciales"
        formControlName="VcDescription"
      />

      <bk-input
        label="Representante legal"
        placeholder="Ej: María López"
        formControlName="VcLegalRepresentative"
      />

      <div class="bk-ob-step2__section-title">
        <span>Sucursal principal</span>
      </div>

      <div class="bk-ob-step2__row">
        <bk-input
          label="Nombre de la sucursal"
          placeholder="Sede Principal"
          formControlName="VcBranchName"
        />
        <bk-input
          label="Dirección de la sucursal"
          placeholder="Misma dirección del negocio"
          formControlName="VcBranchAddress"
        />
      </div>

      <div class="bk-ob-step2__section-title">
        <span>Primera sala / consultorio</span>
      </div>

      <bk-input
        label="Número de sala o consultorio"
        placeholder="1"
        formControlName="VcRoomNumber"
      />

      <div class="bk-ob-step2__actions">
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
    .bk-ob-step2 {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      width: 100%;
    }

    .bk-ob-step2__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--bk-space-md, 1rem);
    }

    @media (max-width: 480px) {
      .bk-ob-step2__row {
        grid-template-columns: 1fr;
      }
    }

    .bk-ob-step2__back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--bk-color-text-muted, #64748b);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.8rem);
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .bk-ob-step2__back:hover {
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-ob-step2__error {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .bk-ob-step2__section-title {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.5rem);
      margin-top: var(--bk-space-xs, 0.25rem);
    }

    .bk-ob-step2__section-title span {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.75rem);
      font-weight: 600;
      color: var(--bk-color-text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      white-space: nowrap;
    }

    .bk-ob-step2__section-title::before,
    .bk-ob-step2__section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: var(--bk-border-color-default, #e2e8f0);
    }

    .bk-ob-step2__actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--bk-space-sm, 0.5rem);
    }

    :host ::ng-deep .bk-ob-step2__actions bk-button,
    :host ::ng-deep .bk-ob-step2__actions bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class OnboardingStep2Component {
  private readonly fb = inject(FormBuilder);

  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly submitted = output<OnboardingStep2Request>();
  readonly back = output<void>();

  readonly form: FormGroup = this.fb.group({
    VcName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    VcPrincipalEmail: ['', [Validators.required, Validators.email]],
    VcPhone: [''],
    VcPrincipalAddress: ['', [Validators.maxLength(150)]],
    VcDescription: ['', [Validators.maxLength(255)]],
    VcLegalRepresentative: ['', [Validators.maxLength(100)]],
    VcBranchName: ['Sede Principal'],
    VcBranchAddress: [''],
    VcRoomNumber: ['1'],
  });

  fieldError(fieldName: string, message: string): string {
    const control = this.form.get(fieldName);
    return control?.touched && control?.invalid ? message : '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.value as OnboardingStep2Request);
  }
}
