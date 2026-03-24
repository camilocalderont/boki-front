import { Component, ChangeDetectionStrategy, input, output, inject, effect, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BkInputComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import type { BranchRoomFormValue } from '@entities/branch-room';
import { BRANCH_ROOM_VALIDATORS, getBranchRoomErrorMessage } from '@entities/branch-room';

export interface BranchRoomFormOutput {
  companyId: string;
  formValue: BranchRoomFormValue;
}

@Component({
  selector: 'bk-branch-room-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companySelectOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <bk-select label="Sede *" formControlName="CompanyBranchId" placeholder="Seleccione una sede"
        [options]="filteredBranchOptions()" [searchable]="true"
        [error]="err('CompanyBranchId')" />

      <bk-input label="Número de sala *" formControlName="VcNumber"
        [error]="err('VcNumber')" />
      <bk-input label="Piso" formControlName="VcFloor" />
      <bk-input label="Torre" formControlName="VcTower" />
      <bk-input label="Teléfono" formControlName="VcPhone" />
      <bk-input label="Email" type="email" formControlName="VcEmail"
        [error]="err('VcEmail')" />

      <div class="bk-form__check">
        <label>
          <input type="checkbox" formControlName="BIsMain" />
          Sala principal
        </label>
      </div>

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear sala' }}
        </bk-button>
        <bk-button variant="ghost" size="md" type="button" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-form { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
    .bk-form__check { display: flex; align-items: center; gap: 0.5rem; }
    .bk-form__check label { display: flex; align-items: center; gap: 0.5rem; font-size: var(--bk-font-size-md, 14px); color: var(--bk-color-text-primary); cursor: pointer; }
    .bk-form__check input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--bk-color-primary); }
  `,
})
export class BranchRoomFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<{ value: string; label: string }[]>([]);
  readonly branchOptions = input<{ Id: number; VcName: string; CompanyId?: number }[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly saved = output<BranchRoomFormOutput>();
  readonly cancelled = output<void>();

  readonly selectedCompanyId = signal<string>('');

  readonly companySelectOptions = computed<BkSelectOption[]>(() => this.companyOptions());

  readonly filteredBranchOptions = computed<BkSelectOption[]>(() => {
    const cid = this.selectedCompanyId();
    const all = this.branchOptions();
    const filtered = cid ? all.filter((b: any) => String(b.CompanyId) === cid) : all;
    return filtered.map(b => ({ value: String(b.Id), label: b.VcName }));
  });

  readonly form = this.fb.group({
    CompanyId:       ['', [Validators.required]],
    CompanyBranchId: ['', BRANCH_ROOM_VALIDATORS.CompanyBranchId],
    VcNumber:        ['', BRANCH_ROOM_VALIDATORS.VcNumber],
    VcFloor:         ['', BRANCH_ROOM_VALIDATORS.VcFloor],
    VcTower:         ['', BRANCH_ROOM_VALIDATORS.VcTower],
    VcPhone:         ['', BRANCH_ROOM_VALIDATORS.VcPhone],
    VcEmail:         ['', BRANCH_ROOM_VALIDATORS.VcEmail],
    BIsMain:         [false],
  });

  constructor() {
    // Sync CompanyId form control → signal for computed filtering
    this.form.get('CompanyId')!.valueChanges.subscribe(v => {
      this.selectedCompanyId.set(v ?? '');
      // Reset branch when company changes
      this.form.get('CompanyBranchId')!.setValue('', { emitEvent: false });
    });

    effect(() => {
      const data = this.editData();
      const defaultId = this.defaultCompanyId();
      if (data) {
        const companyId = String(data['CompanyId'] ?? data['CompanyBranch']?.CompanyId ?? defaultId);
        this.form.patchValue({
          CompanyId: companyId,
          CompanyBranchId: String(data['CompanyBranch']?.Id ?? data['CompanyBranchId'] ?? ''),
          VcNumber: data['VcNumber'] ?? '',
          VcFloor: data['VcFloor'] ?? '',
          VcTower: data['VcTower'] ?? '',
          VcPhone: data['VcPhone'] ?? '',
          VcEmail: data['VcEmail'] ?? '',
          BIsMain: data['BIsMain'] ?? false,
        });
        this.selectedCompanyId.set(companyId);
      } else {
        this.form.reset({ CompanyId: defaultId, BIsMain: false });
        this.selectedCompanyId.set(defaultId);
      }
    });
  }

  err(field: keyof BranchRoomFormValue): string {
    return getBranchRoomErrorMessage(this.form.get(field), field);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, ...rest } = this.form.getRawValue();
    this.saved.emit({ companyId: CompanyId ?? '', formValue: rest as unknown as BranchRoomFormValue });
  }
}
