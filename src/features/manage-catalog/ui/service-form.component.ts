import { Component, ChangeDetectionStrategy, input, output, inject, effect, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BkInputComponent, BkTextareaComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import type { ServiceFormValue } from '@entities/service';
import { SERVICE_VALIDATORS, getServiceErrorMessage } from '@entities/service';
import type { Category } from '@entities/category';

export interface ServiceFormOutput {
  companyId: string;
  categoryId: string;
  formValue: ServiceFormValue;
}

@Component({
  selector: 'bk-service-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkTextareaComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companyOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <bk-select label="Categoría *" formControlName="CategoryId" placeholder="Seleccione una categoría"
        [options]="filteredCategoryOptions()" [searchable]="true"
        [error]="form.get('CategoryId')?.touched && form.get('CategoryId')?.invalid ? 'Categoría es obligatorio' : ''" />

      <bk-input label="Nombre *" formControlName="VcName"
        [error]="err('VcName')" />

      <bk-textarea label="Descripción" formControlName="VcDescription" [rows]="2" />

      <div class="bk-form__row">
        <bk-input label="Precio mínimo *" type="number" formControlName="IMinimalPrice"
          [error]="err('IMinimalPrice')" />
        <bk-input label="Precio máximo *" type="number" formControlName="IMaximalPrice"
          [error]="err('IMaximalPrice')" />
        <bk-input label="Precio regular *" type="number" formControlName="IRegularPrice"
          [error]="err('IRegularPrice')" />
      </div>

      <bk-input label="Duración (HH:MM) *" formControlName="VcTime" placeholder="01:00"
        [error]="err('VcTime')" />

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear servicio' }}
        </bk-button>
        <bk-button variant="ghost" size="md" type="button" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-form { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-form__row { display: flex; gap: var(--bk-space-md, 1rem); }
    .bk-form__row > * { flex: 1; }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
  `,
})
export class ServiceFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<BkSelectOption[]>([]);
  readonly categoryOptions = input<Category[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly defaultCategoryId = input<string>('');
  readonly saved = output<ServiceFormOutput>();
  readonly cancelled = output<void>();

  private readonly selectedCompanyId = signal<string>('');

  readonly filteredCategoryOptions = computed<BkSelectOption[]>(() => {
    const cid = this.selectedCompanyId();
    const all = this.categoryOptions();
    const filtered = cid ? all.filter(c => String(c.CompanyId) === cid) : all;
    return filtered.map(c => ({ value: String(c.Id), label: c.VcName }));
  });

  readonly form = this.fb.group({
    CompanyId:     ['', [Validators.required]],
    CategoryId:    ['', [Validators.required]],
    VcName:        ['', SERVICE_VALIDATORS.VcName],
    VcDescription: ['', SERVICE_VALIDATORS.VcDescription],
    IMinimalPrice: [0, SERVICE_VALIDATORS.IMinimalPrice],
    IMaximalPrice: [0, SERVICE_VALIDATORS.IMaximalPrice],
    IRegularPrice: [0, SERVICE_VALIDATORS.IRegularPrice],
    VcTime:        ['', SERVICE_VALIDATORS.VcTime],
  });

  constructor() {
    this.form.get('CompanyId')!.valueChanges.subscribe(v => {
      this.selectedCompanyId.set(v ?? '');
      this.form.get('CategoryId')!.setValue('', { emitEvent: false });
    });

    effect(() => {
      const data = this.editData();
      const defaultCid = this.defaultCompanyId();
      const defaultCatId = this.defaultCategoryId();
      if (data) {
        const companyId = String(data['CompanyId'] ?? defaultCid);
        this.selectedCompanyId.set(companyId);
        this.form.patchValue({
          CompanyId: companyId,
          CategoryId: String(data['CategoryId'] ?? defaultCatId),
          VcName: data['VcName'] ?? '',
          VcDescription: data['VcDescription'] ?? '',
          IMinimalPrice: data['IMinimalPrice'] ?? 0,
          IMaximalPrice: data['IMaximalPrice'] ?? 0,
          IRegularPrice: data['IRegularPrice'] ?? 0,
          VcTime: data['VcTime'] ?? '',
        });
      } else {
        this.selectedCompanyId.set(defaultCid);
        this.form.reset({
          CompanyId: defaultCid,
          CategoryId: defaultCatId,
          IMinimalPrice: 0,
          IMaximalPrice: 0,
          IRegularPrice: 0,
        });
      }
    });
  }

  err(field: keyof ServiceFormValue): string {
    return getServiceErrorMessage(this.form.get(field), field);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, CategoryId, ...formValue } = this.form.getRawValue();
    this.saved.emit({
      companyId: CompanyId ?? '',
      categoryId: CategoryId ?? '',
      formValue: formValue as ServiceFormValue,
    });
  }
}
