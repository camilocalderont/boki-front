import { Component, ChangeDetectionStrategy, input, output, inject, effect, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { BkTextareaComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import type { FaqFormValue } from '@entities/faq';
import { FAQ_VALIDATORS, getFaqErrorMessage } from '@entities/faq';
import type { Category } from '@entities/category';

export interface FaqFormOutput {
  companyId: string;
  categoryId: string;
  formValue: FaqFormValue;
  tagIds: number[];
}

@Component({
  selector: 'bk-faq-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkTextareaComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companyOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <bk-select label="Categoría *" formControlName="CategoryServiceId" placeholder="Seleccione una categoría"
        [options]="filteredCategoryOptions()" [searchable]="true"
        [error]="form.get('CategoryServiceId')?.touched && form.get('CategoryServiceId')?.invalid ? 'Categoría es obligatorio' : ''" />

      <bk-textarea label="Pregunta *" formControlName="VcQuestion" [rows]="3"
        [error]="err('VcQuestion')" />

      <bk-textarea label="Respuesta *" formControlName="VcAnswer" [rows]="4"
        [error]="err('VcAnswer')" />

      <div class="bk-form__tag-section">
        <bk-select label="Etiquetas" [options]="availableTagOptions()" [searchable]="true"
          placeholder="Buscar y agregar etiquetas" [formControl]="tagSelectControl" />
        <div class="bk-form__tags">
          @for (tag of selectedTags(); track tag.id) {
            <span class="bk-form__tag-chip">
              {{ tag.name }}
              <button type="button" (click)="removeTag(tag.id)" class="bk-form__tag-remove">&times;</button>
            </span>
          }
        </div>
      </div>

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear FAQ' }}
        </bk-button>
        <bk-button variant="ghost" size="md" type="button" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-form { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
    .bk-form__tag-section { display: flex; flex-direction: column; gap: 6px; }
    .bk-form__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .bk-form__tag-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 12px; font-size: 12px;
      background: var(--bk-color-primary-100, #e0e7ff);
      color: var(--bk-color-primary-700, #3730a3);
    }
    .bk-form__tag-remove {
      background: none; border: none; cursor: pointer; font-size: 14px; line-height: 1;
      color: var(--bk-color-primary-500, #6366f1);
    }
  `,
})
export class FaqFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<BkSelectOption[]>([]);
  readonly categoryOptions = input<Category[]>([]);
  readonly tagOptions = input<BkSelectOption[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly saved = output<FaqFormOutput>();
  readonly cancelled = output<void>();

  private readonly selectedCompanyId = signal<string>('');
  readonly selectedTags = signal<{ id: number; name: string }[]>([]);
  readonly tagSelectControl = new FormControl('');

  readonly filteredCategoryOptions = computed<BkSelectOption[]>(() => {
    const cid = this.selectedCompanyId();
    const all = this.categoryOptions();
    const filtered = cid ? all.filter(c => String(c.CompanyId) === cid && c.BIsService === false) : all.filter(c => c.BIsService === false);
    return filtered.map(c => ({ value: String(c.Id), label: c.VcName }));
  });

  readonly availableTagOptions = computed<BkSelectOption[]>(() => {
    const selected = this.selectedTags();
    const selectedIds = new Set(selected.map(t => String(t.id)));
    return this.tagOptions().filter(o => !selectedIds.has(o.value));
  });

  readonly form = this.fb.group({
    CompanyId:         ['', [Validators.required]],
    CategoryServiceId: ['', [Validators.required]],
    VcQuestion:        ['', FAQ_VALIDATORS.VcQuestion],
    VcAnswer:          ['', FAQ_VALIDATORS.VcAnswer],
  });

  constructor() {
    this.form.get('CompanyId')!.valueChanges.subscribe(v => {
      this.selectedCompanyId.set(v ?? '');
      this.form.get('CategoryServiceId')!.setValue('', { emitEvent: false });
    });

    this.tagSelectControl.valueChanges.subscribe(v => {
      if (v) {
        this.onTagSelected(v);
        this.tagSelectControl.setValue('', { emitEvent: false });
      }
    });

    effect(() => {
      const data = this.editData();
      const defaultCid = this.defaultCompanyId();
      if (data) {
        const companyId = String(data['CompanyId'] ?? defaultCid);
        this.selectedCompanyId.set(companyId);
        this.form.patchValue({
          CompanyId: companyId,
          CategoryServiceId: String(data['CategoryServiceId'] ?? ''),
          VcQuestion: data['VcQuestion'] ?? '',
          VcAnswer: data['VcAnswer'] ?? '',
        });
        // Pre-load tags from editData
        const faqsTags = data['FaqsTags'] as { Id: number; TagsId: number; Tag?: { Id: number; VcName: string } }[] | undefined;
        if (faqsTags && faqsTags.length > 0) {
          this.selectedTags.set(
            faqsTags
              .filter(ft => ft.Tag)
              .map(ft => ({ id: ft.Tag!.Id, name: ft.Tag!.VcName }))
          );
        } else {
          this.selectedTags.set([]);
        }
      } else {
        this.selectedCompanyId.set(defaultCid);
        this.form.reset({ CompanyId: defaultCid });
        this.selectedTags.set([]);
      }
    });
  }

  err(field: keyof FaqFormValue): string {
    return getFaqErrorMessage(this.form.get(field), field);
  }

  onTagSelected(value: string): void {
    if (!value) return;
    const tagOpt = this.tagOptions().find(o => o.value === value);
    if (!tagOpt) return;
    const alreadySelected = this.selectedTags().some(t => t.id === Number(value));
    if (alreadySelected) return;
    this.selectedTags.update(tags => [...tags, { id: Number(value), name: tagOpt.label }]);
  }

  removeTag(tagId: number): void {
    this.selectedTags.update(tags => tags.filter(t => t.id !== tagId));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, CategoryServiceId, ...formValue } = this.form.getRawValue();
    this.saved.emit({
      companyId: CompanyId ?? '',
      categoryId: CategoryServiceId ?? '',
      formValue: formValue as FaqFormValue,
      tagIds: this.selectedTags().map(t => t.id),
    });
  }
}
