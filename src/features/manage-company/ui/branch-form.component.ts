import { Component, ChangeDetectionStrategy, input, output, inject, effect, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BkInputComponent, BkTextareaComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import type { BranchFormValue } from '@entities/company';
import { BRANCH_VALIDATORS, getBranchErrorMessage } from '@entities/company';

export interface BranchFormOutput {
  companyId: string;
  formValue: BranchFormValue;
}

@Component({
  selector: 'bk-branch-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkTextareaComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companySelectOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <bk-input label="Nombre de la sede *" formControlName="VcName"
        [error]="err('VcName')" />
      <bk-input label="Dirección *" formControlName="VcAddress"
        [error]="err('VcAddress')" />
      <bk-input label="Email" type="email" formControlName="VcEmail"
        [error]="err('VcEmail')" />
      <bk-input label="Teléfono" formControlName="VcPhone" />
      <bk-input label="Nombre del encargado" formControlName="VcBranchManagerName" />
      <bk-textarea label="Descripción" formControlName="VcDescription" [rows]="2" />

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear sede' }}
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
export class BranchFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<{ value: string; label: string }[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly saved = output<BranchFormOutput>();
  readonly cancelled = output<void>();

  readonly companySelectOptions = computed<BkSelectOption[]>(() => this.companyOptions());

  readonly form = this.fb.group({
    CompanyId:           ['', [Validators.required]],
    VcName:              ['', BRANCH_VALIDATORS.VcName],
    VcAddress:           ['', BRANCH_VALIDATORS.VcAddress],
    VcEmail:             ['', BRANCH_VALIDATORS.VcEmail],
    VcPhone:             ['', BRANCH_VALIDATORS.VcPhone],
    VcBranchManagerName: ['', BRANCH_VALIDATORS.VcBranchManagerName],
    VcDescription:       ['', BRANCH_VALIDATORS.VcDescription],
  });

  constructor() {
    effect(() => {
      const data = this.editData();
      const defaultId = this.defaultCompanyId();
      if (data) {
        this.form.patchValue({
          CompanyId: String(data['CompanyId'] ?? defaultId),
          VcName: data['VcName'] ?? '',
          VcAddress: data['VcAddress'] ?? '',
          VcEmail: data['VcEmail'] ?? '',
          VcPhone: data['VcPhone'] ?? '',
          VcBranchManagerName: data['VcBranchManagerName'] ?? '',
          VcDescription: data['VcDescription'] ?? '',
        });
      } else {
        this.form.reset({ CompanyId: defaultId });
      }
    });
  }

  err(field: keyof BranchFormValue): string {
    return getBranchErrorMessage(this.form.get(field), field);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, ...formValue } = this.form.getRawValue();
    this.saved.emit({ companyId: CompanyId ?? '', formValue: formValue as BranchFormValue });
  }
}
