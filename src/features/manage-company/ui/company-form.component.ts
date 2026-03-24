import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BkInputComponent, BkTextareaComponent, BkButtonComponent } from '@shared/ui';
import type { CompanyFormValue } from '@entities/company';
import { COMPANY_VALIDATORS, getCompanyErrorMessage } from '@entities/company';

@Component({
  selector: 'bk-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkTextareaComponent, BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-input label="Nombre *" formControlName="VcName"
        [error]="err('VcName')" />
      <bk-input label="NIT" formControlName="VcNit"
        [error]="err('VcNit')" />
      <bk-input label="Email" type="email" formControlName="VcPrincipalEmail"
        [error]="err('VcPrincipalEmail')" />
      <bk-input label="Teléfono" formControlName="VcPhone" />
      <bk-input label="Dirección" formControlName="VcPrincipalAddress" />
      <bk-input label="Representante legal" formControlName="VcLegalRepresentative" />
      <bk-textarea label="Descripción" formControlName="VcDescription" [rows]="3" />

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear empresa' }}
        </bk-button>
        <bk-button variant="ghost" size="md" type="button" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-form { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
  `,
})
export class CompanyFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly saved = output<CompanyFormValue>();
  readonly cancelled = output<void>();

  readonly form = this.fb.group({
    VcName:                ['', COMPANY_VALIDATORS.VcName],
    VcNit:                 ['', COMPANY_VALIDATORS.VcNit],
    VcPrincipalEmail:      ['', COMPANY_VALIDATORS.VcPrincipalEmail],
    VcPhone:               ['', COMPANY_VALIDATORS.VcPhone],
    VcPrincipalAddress:    ['', COMPANY_VALIDATORS.VcPrincipalAddress],
    VcLegalRepresentative: ['', COMPANY_VALIDATORS.VcLegalRepresentative],
    VcDescription:         ['', COMPANY_VALIDATORS.VcDescription],
  });

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          VcName: data['VcName'] ?? '',
          VcNit: data['VcNit'] ?? '',
          VcPrincipalEmail: data['VcPrincipalEmail'] ?? data['VcEmail'] ?? '',
          VcPhone: data['VcPhone'] ?? '',
          VcPrincipalAddress: data['VcPrincipalAddress'] ?? '',
          VcLegalRepresentative: data['VcLegalRepresentative'] ?? '',
          VcDescription: data['VcDescription'] ?? '',
        });
      } else {
        this.form.reset();
      }
    });
  }

  err(field: keyof CompanyFormValue): string {
    return getCompanyErrorMessage(this.form.get(field), field);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saved.emit(this.form.getRawValue() as CompanyFormValue);
  }
}
