import { Component, ChangeDetectionStrategy, input, output, inject, effect, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { BkInputComponent, BkButtonComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';

export interface ProfessionalFormOutput {
  companyId: string;
  formValue: Record<string, any>;
  serviceIds: number[];
  branchRoomIds: number[];
}

@Component({
  selector: 'bk-professional-form',
  standalone: true,
  imports: [ReactiveFormsModule, BkInputComponent, BkButtonComponent, BkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bk-form">
      <bk-select label="Empresa *" formControlName="CompanyId" placeholder="Seleccione una empresa"
        [options]="companyOptions()" [searchable]="true"
        [error]="form.get('CompanyId')?.touched && form.get('CompanyId')?.invalid ? 'Empresa es obligatorio' : ''" />

      <div class="bk-form__row">
        <bk-input label="Primer nombre *" formControlName="VcFirstName"
          [error]="form.get('VcFirstName')?.touched && form.get('VcFirstName')?.invalid ? 'Mínimo 3 caracteres' : ''" />
        <bk-input label="Segundo nombre" formControlName="VcSecondName" />
      </div>

      <div class="bk-form__row">
        <bk-input label="Primer apellido *" formControlName="VcFirstLastName"
          [error]="form.get('VcFirstLastName')?.touched && form.get('VcFirstLastName')?.invalid ? 'Mínimo 3 caracteres' : ''" />
        <bk-input label="Segundo apellido" formControlName="VcSecondLastName" />
      </div>

      <div class="bk-form__row">
        <bk-input label="Email *" formControlName="VcEmail" type="email"
          [error]="form.get('VcEmail')?.touched && form.get('VcEmail')?.invalid ? 'Email inválido' : ''" />
        <bk-input label="Teléfono" formControlName="VcPhone" />
      </div>

      <div class="bk-form__row">
        <bk-input label="Número de identificación *" formControlName="VcIdentificationNumber"
          [error]="form.get('VcIdentificationNumber')?.touched && form.get('VcIdentificationNumber')?.invalid ? 'Mínimo 6 caracteres' : ''" />
        <bk-input label="Número de licencia" formControlName="VcLicenseNumber" />
      </div>

      <div class="bk-form__row">
        <bk-input label="Profesión *" formControlName="VcProfession"
          [error]="form.get('VcProfession')?.touched && form.get('VcProfession')?.invalid ? 'Mínimo 3 caracteres' : ''" />
        <bk-input label="Especialización" formControlName="VcSpecialization" />
      </div>

      <bk-input label="Años de experiencia" formControlName="IYearsOfExperience" type="number" />

      <!-- Multi-select Consultorios (BranchRooms) - like FAQs tags -->
      <div class="bk-form__tag-section">
        <bk-select label="Consultorios" [options]="availableBranchRoomOptions()" [searchable]="true"
          placeholder="Buscar y agregar consultorios" [formControl]="branchRoomSelectControl" />
        <div class="bk-form__tags">
          @for (room of selectedBranchRooms(); track room.id) {
            <span class="bk-form__tag-chip">
              {{ room.name }}
              <button type="button" (click)="removeBranchRoom(room.id)" class="bk-form__tag-remove">&times;</button>
            </span>
          }
        </div>
      </div>

      <!-- Multi-select Services - like FAQs tags -->
      <div class="bk-form__tag-section">
        <bk-select label="Servicios" [options]="availableServiceOptions()" [searchable]="true"
          placeholder="Buscar y agregar servicios" [formControl]="serviceSelectControl" />
        <div class="bk-form__tags">
          @for (svc of selectedServices(); track svc.id) {
            <span class="bk-form__tag-chip bk-form__tag-chip--service">
              {{ svc.name }}
              <button type="button" (click)="removeService(svc.id)" class="bk-form__tag-remove">&times;</button>
            </span>
          }
        </div>
      </div>

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" type="submit" [loading]="loading()" [disabled]="form.invalid">
          {{ editData() ? 'Guardar cambios' : 'Crear Profesional' }}
        </bk-button>
        <bk-button variant="ghost" size="md" type="button" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </form>
  `,
  styles: `
    .bk-form { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--bk-space-md, 1rem); }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
    .bk-form__tag-section { display: flex; flex-direction: column; gap: 6px; }
    .bk-form__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .bk-form__tag-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 12px; font-size: 12px;
      background: var(--bk-color-primary-100, #e0e7ff);
      color: var(--bk-color-primary-700, #3730a3);
    }
    .bk-form__tag-chip--service {
      background: var(--bk-color-success-100, #dcfce7);
      color: var(--bk-color-success-700, #15803d);
    }
    .bk-form__tag-remove {
      background: none; border: none; cursor: pointer; font-size: 14px; line-height: 1;
      color: var(--bk-color-primary-500, #6366f1);
    }
    .bk-form__tag-chip--service .bk-form__tag-remove {
      color: var(--bk-color-success-500, #22c55e);
    }
  `,
})
export class ProfessionalFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly editData = input<Record<string, any> | null>(null);
  readonly loading = input<boolean>(false);
  readonly companyOptions = input<BkSelectOption[]>([]);
  readonly branchRoomOptions = input<BkSelectOption[]>([]);
  readonly serviceOptions = input<BkSelectOption[]>([]);
  readonly defaultCompanyId = input<string>('');
  readonly saved = output<ProfessionalFormOutput>();
  readonly cancelled = output<void>();

  readonly selectedBranchRooms = signal<{ id: number; name: string }[]>([]);
  readonly selectedServices = signal<{ id: number; name: string }[]>([]);
  readonly branchRoomSelectControl = new FormControl('');
  readonly serviceSelectControl = new FormControl('');

  readonly availableBranchRoomOptions = computed<BkSelectOption[]>(() => {
    const selected = this.selectedBranchRooms();
    const selectedIds = new Set(selected.map(r => String(r.id)));
    return this.branchRoomOptions().filter(o => !selectedIds.has(o.value));
  });

  readonly availableServiceOptions = computed<BkSelectOption[]>(() => {
    const selected = this.selectedServices();
    const selectedIds = new Set(selected.map(s => String(s.id)));
    return this.serviceOptions().filter(o => !selectedIds.has(o.value));
  });

  readonly form = this.fb.group({
    CompanyId:              ['', [Validators.required]],
    VcFirstName:            ['', [Validators.required, Validators.minLength(3)]],
    VcSecondName:           [''],
    VcFirstLastName:        ['', [Validators.required, Validators.minLength(3)]],
    VcSecondLastName:       [''],
    VcEmail:                ['', [Validators.required, Validators.email]],
    VcPhone:                [''],
    VcIdentificationNumber: ['', [Validators.required, Validators.minLength(6)]],
    VcLicenseNumber:        [''],
    VcProfession:           ['', [Validators.required, Validators.minLength(3)]],
    VcSpecialization:       [''],
    IYearsOfExperience:     [0],
  });

  constructor() {
    this.branchRoomSelectControl.valueChanges.subscribe(v => {
      if (v) {
        this.onBranchRoomSelected(v);
        this.branchRoomSelectControl.setValue('', { emitEvent: false });
      }
    });

    this.serviceSelectControl.valueChanges.subscribe(v => {
      if (v) {
        this.onServiceSelected(v);
        this.serviceSelectControl.setValue('', { emitEvent: false });
      }
    });

    effect(() => {
      const data = this.editData();
      const defaultCid = this.defaultCompanyId();
      if (data) {
        const companyId = String(data['CompanyId'] ?? defaultCid);
        this.form.patchValue({
          CompanyId: companyId,
          VcFirstName: data['VcFirstName'] ?? '',
          VcSecondName: data['VcSecondName'] ?? '',
          VcFirstLastName: data['VcFirstLastName'] ?? '',
          VcSecondLastName: data['VcSecondLastName'] ?? '',
          VcEmail: data['VcEmail'] ?? '',
          VcPhone: data['VcPhone'] ?? '',
          VcIdentificationNumber: data['VcIdentificationNumber'] ?? '',
          VcLicenseNumber: data['VcLicenseNumber'] ?? '',
          VcProfession: data['VcProfession'] ?? '',
          VcSpecialization: data['VcSpecialization'] ?? '',
          IYearsOfExperience: data['IYearsOfExperience'] ?? 0,
        });
        // Pre-load BranchRooms from BussinessHours
        const hours = data['BussinessHours'] as any[] | undefined;
        if (hours && hours.length > 0) {
          const roomMap = new Map<number, string>();
          hours.forEach(h => {
            if (h.CompanyBranchRoom) {
              roomMap.set(h.CompanyBranchRoom.Id, h.CompanyBranchRoom.VcNumber);
            } else if (h.CompanyBranchRoomId) {
              roomMap.set(h.CompanyBranchRoomId, `Consultorio ${h.CompanyBranchRoomId}`);
            }
          });
          this.selectedBranchRooms.set(
            Array.from(roomMap.entries()).map(([id, name]) => ({ id, name }))
          );
        } else {
          this.selectedBranchRooms.set([]);
        }
        // Pre-load Services
        const services = data['Services'] as any[] | undefined;
        if (services && services.length > 0) {
          this.selectedServices.set(
            services
              .filter(s => s.Service)
              .map(s => ({ id: s.Service.Id ?? s.ServiceId, name: s.Service.VcName }))
          );
        } else {
          this.selectedServices.set([]);
        }
      } else {
        this.form.reset({ CompanyId: defaultCid, IYearsOfExperience: 0 });
        this.selectedBranchRooms.set([]);
        this.selectedServices.set([]);
      }
    });
  }

  onBranchRoomSelected(value: string): void {
    if (!value) return;
    const opt = this.branchRoomOptions().find(o => o.value === value);
    if (!opt) return;
    if (this.selectedBranchRooms().some(r => r.id === Number(value))) return;
    this.selectedBranchRooms.update(rooms => [...rooms, { id: Number(value), name: opt.label }]);
  }

  removeBranchRoom(id: number): void {
    this.selectedBranchRooms.update(rooms => rooms.filter(r => r.id !== id));
  }

  onServiceSelected(value: string): void {
    if (!value) return;
    const opt = this.serviceOptions().find(o => o.value === value);
    if (!opt) return;
    if (this.selectedServices().some(s => s.id === Number(value))) return;
    this.selectedServices.update(svcs => [...svcs, { id: Number(value), name: opt.label }]);
  }

  removeService(id: number): void {
    this.selectedServices.update(svcs => svcs.filter(s => s.id !== id));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { CompanyId, ...formValue } = this.form.getRawValue();
    this.saved.emit({
      companyId: CompanyId ?? '',
      formValue,
      serviceIds: this.selectedServices().map(s => s.id),
      branchRoomIds: this.selectedBranchRooms().map(r => r.id),
    });
  }
}
