import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BkInputComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import type { CategoryFormValue } from '@entities/category';
import { CATEGORY_VALIDATORS, getCategoryErrorMessage } from '@entities/category';

export interface CategoryFormOutput {
  companyId: string;
  formValue: CategoryFormValue;
}

@Component({
  selector: 'bk-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companyOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <bk-input label="Nombre *" formControlName="VcName"
        [error]="err('VcName')" />

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear categoría' }}
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
export class CategoryFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<BkSelectOption[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly saved = output<CategoryFormOutput>();
  readonly cancelled = output<void>();

  readonly form = this.fb.group({
    CompanyId:  ['', [Validators.required]],
    VcName:     ['', CATEGORY_VALIDATORS.VcName],
    BIsService: [true],
  });

  constructor() {
    effect(() => {
      const data = this.editData();
      const defaultId = this.defaultCompanyId();
      if (data) {
        this.form.patchValue({
          CompanyId: String(data['CompanyId'] ?? defaultId),
          VcName: data['VcName'] ?? '',
          BIsService: data['BIsService'] ?? true,
        });
      } else {
        this.form.reset({ CompanyId: defaultId, BIsService: true });
      }
    });
  }

  err(field: keyof CategoryFormValue): string {
    return getCategoryErrorMessage(this.form.get(field), field);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, ...formValue } = this.form.getRawValue();
    this.saved.emit({ companyId: CompanyId ?? '', formValue: formValue as CategoryFormValue });
  }
}
