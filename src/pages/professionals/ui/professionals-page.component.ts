import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BkSpinnerComponent, BkButtonComponent, BkModalComponent, BkSelectComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { ProfessionalStore, ProfessionalFormComponent, BusinessHoursFormComponent } from '@features/manage-professionals';
import type { ProfessionalFormOutput } from '@features/manage-professionals';
import { ProfessionalApiService } from '@entities/professional';
import type { CreateProfessionalRequest } from '@entities/professional';
import { CompanyApiService } from '@entities/company';
import { ServiceApiService } from '@entities/service';
import { BranchRoomApiService } from '@entities/branch-room';
import { UserStore } from '@entities/user';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'bk-professionals-page',
  imports: [
    ReactiveFormsModule,
    BkSpinnerComponent, BkButtonComponent, BkModalComponent,
    BkDataTableComponent, BkConfirmDialogComponent,
    BkSelectComponent,
    ProfessionalFormComponent, BusinessHoursFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Profesionales</h1>
          <p class="bk-page__subtitle">Gestión de profesionales, servicios y horarios</p>
        </div>
        <bk-button variant="primary" size="md" (clicked)="openCreate()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Profesional
        </bk-button>
      </div>

      <div class="bk-page__filter-bar">
        <bk-select label="Empresa" [formControl]="selectedCompanyId" placeholder="Seleccione una empresa"
          [options]="companySelectOptions()" [searchable]="true" />
      </div>

      @if (loading()) {
        <div class="bk-page__loader"><bk-spinner /></div>
      } @else {
        <bk-data-table
          [data]="tableData()"
          [columns]="columns"
          [showActions]="true"
          [showDeleteAction]="true"
          [showScheduleAction]="true"
          trackByKey="Id"
          emptyMessage="No hay profesionales registrados para esta empresa"
          (editClicked)="onEdit($event)"
          (deleteClicked)="onDelete($event)"
          (scheduleClicked)="onSchedule($event)"
        />
      }

      <!-- Create/Edit Modal -->
      <bk-modal [open]="showFormModal()" [title]="selectedItem() ? 'Editar Profesional' : 'Crear Profesional'" size="lg" (closed)="closeModals()">
        <bk-professional-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [branchRoomOptions]="branchRoomSelectOptions()"
          [serviceOptions]="serviceSelectOptions()"
          [defaultCompanyId]="selectedCompanyId.value ?? ''"
          (saved)="saveProfessional($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- Business Hours Modal -->
      <bk-modal [open]="showHoursModal()" title="Horarios de atención" size="xl" (closed)="closeModals()">
        @if (hoursItem()) {
          <p class="bk-page__hours-subtitle">
            {{ hoursItem()!['VcFirstName'] }} {{ hoursItem()!['VcFirstLastName'] }}
          </p>
        }
        <bk-business-hours-form
          [existingHours]="existingHours()"
          [branchRoomOptions]="branchRoomSelectOptions()"
          [loading]="savingHours()"
          (saved)="saveBusinessHours($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- Delete Confirmation -->
      <bk-confirm-dialog
        [open]="showDeleteConfirm()"
        title="¿Eliminar profesional?"
        message="Esta acción no se puede deshacer. Se eliminará el profesional y todos sus horarios asociados."
        confirmLabel="Eliminar"
        variant="danger"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteConfirm.set(false)"
      />
    </div>
  `,
  styles: [`
    .bk-page { padding: 24px 0; }
    .bk-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
    .bk-page__title { font-size: var(--bk-font-size-xl, 20px); font-weight: 600; color: var(--bk-color-text-primary); margin: 0; line-height: 1.3; }
    .bk-page__subtitle { font-size: var(--bk-font-size-sm, 12px); color: var(--bk-color-text-muted); margin-top: 4px; }
    .bk-page__loader { display: flex; justify-content: center; padding: 48px; }
    .bk-page__filter-bar {
      display: flex;
      align-items: flex-end;
      gap: var(--bk-space-md, 1rem);
      margin-bottom: var(--bk-space-md, 1rem);
      padding: var(--bk-space-md, 1rem);
      background: var(--bk-bg-surface, #fff);
      border-radius: var(--bk-border-radius-md, 8px);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
    }
    .bk-page__filter-bar bk-select { flex: 1; max-width: 400px; }
    .bk-page__hours-subtitle {
      font-size: var(--bk-font-size-base, 14px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin-bottom: var(--bk-space-md, 1rem);
    }
  `],
})
export class ProfessionalsPageComponent implements OnInit {
  protected store = inject(ProfessionalStore);
  private api = inject(ProfessionalApiService);
  private companyApi = inject(CompanyApiService);
  private serviceApi = inject(ServiceApiService);
  private branchRoomApi = inject(BranchRoomApiService);
  private alertService = inject(AlertService);
  private userStore = inject(UserStore);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly savingHours = signal(false);
  readonly showFormModal = signal(false);
  readonly showHoursModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly selectedItem = signal<Record<string, any> | null>(null);
  readonly hoursItem = signal<Record<string, any> | null>(null);
  readonly existingHours = signal<any[]>([]);

  readonly companies = signal<{ id: string; name: string }[]>([]);
  readonly allServices = signal<{ Id: number; VcName: string; CompanyId: number }[]>([]);
  readonly allBranchRooms = signal<{ Id: number; VcNumber: string; CompanyBranch?: any }[]>([]);

  readonly selectedCompanyId = new FormControl('');

  readonly companySelectOptions = computed<BkSelectOption[]>(() =>
    this.companies().map(c => ({ value: c.id, label: c.name }))
  );

  readonly serviceSelectOptions = computed<BkSelectOption[]>(() => {
    const companyId = this.selectedCompanyId.value;
    const services = this.allServices();
    const filtered = companyId ? services.filter(s => String(s.CompanyId) === companyId) : services;
    return filtered.map(s => ({ value: String(s.Id), label: s.VcName }));
  });

  readonly branchRoomSelectOptions = computed<BkSelectOption[]>(() =>
    this.allBranchRooms().map(r => ({ value: String(r.Id), label: r.VcNumber }))
  );

  readonly columns: DataTableColumn[] = [
    { key: 'FullName', label: 'Nombre completo', sortable: true },
    { key: 'VcEmail', label: 'Email', sortable: true },
    { key: 'VcProfession', label: 'Profesión', sortable: true },
    { key: 'ServicesText', label: 'Servicios' },
    { key: 'VcPhone', label: 'Teléfono' },
  ];

  readonly tableData = computed(() => {
    return this.store.items().map(p => ({
      ...p,
      FullName: [p.VcFirstName, p.VcSecondName, p.VcFirstLastName, p.VcSecondLastName]
        .filter(Boolean).join(' '),
      ServicesText: (p.Services ?? [])
        .map(s => s.Service?.VcName)
        .filter(Boolean)
        .join(', ') || '—',
    }));
  });

  ngOnInit(): void {
    this.loadCompanies();

    this.selectedCompanyId.valueChanges.subscribe(v => {
      if (v) {
        this.loadProfessionalsByCompany();
        this.loadServicesByCompany();
        this.loadBranchRooms();
      }
    });
  }

  openCreate(): void {
    this.selectedItem.set(null);
    this.showFormModal.set(true);
  }

  onEdit(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showFormModal.set(true);
  }

  onDelete(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showDeleteConfirm.set(true);
  }

  onSchedule(row: Record<string, any>): void {
    this.hoursItem.set(row);
    const professionalId = row['Id'];
    if (professionalId) {
      this.api.getBusinessHours(professionalId).subscribe({
        next: (res) => {
          this.existingHours.set(res.data ?? []);
          this.showHoursModal.set(true);
        },
        error: () => {
          // If endpoint fails, use BussinessHours from the row data
          this.existingHours.set(row['BussinessHours'] ?? []);
          this.showHoursModal.set(true);
        },
      });
    }
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.showHoursModal.set(false);
    this.selectedItem.set(null);
    this.hoursItem.set(null);
    this.existingHours.set([]);
  }

  // ── Professional CRUD ──

  saveProfessional(output: ProfessionalFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const companyId = Number(output.companyId);

    if (!companyId) {
      this.alertService.showError('Seleccione una empresa');
      this.saving.set(false);
      return;
    }

    const payload: CreateProfessionalRequest = {
      CompanyId: companyId,
      VcFirstName: output.formValue['VcFirstName'],
      VcSecondName: output.formValue['VcSecondName'] || undefined,
      VcFirstLastName: output.formValue['VcFirstLastName'],
      VcSecondLastName: output.formValue['VcSecondLastName'] || undefined,
      VcEmail: output.formValue['VcEmail'],
      VcPhone: output.formValue['VcPhone'] || undefined,
      VcIdentificationNumber: output.formValue['VcIdentificationNumber'],
      VcLicenseNumber: output.formValue['VcLicenseNumber'] || undefined,
      VcProfession: output.formValue['VcProfession'],
      VcSpecialization: output.formValue['VcSpecialization'] || undefined,
      IYearsOfExperience: output.formValue['IYearsOfExperience'] ?? 0,
      Services: output.serviceIds.map(id => ({ ServiceId: id })),
    };

    const obs = selected
      ? this.api.update(selected['Id'], payload)
      : this.api.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(
          selected ? 'Profesional actualizado correctamente' : 'Profesional creado correctamente',
        );
        this.closeModals();
        this.loadProfessionalsByCompany();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar profesional');
        this.saving.set(false);
      },
    });
  }

  // ── Business Hours ──

  saveBusinessHours(hours: any[]): void {
    const item = this.hoursItem();
    if (!item) return;
    const professionalId = item['Id'];

    this.savingHours.set(true);
    this.api.updateBusinessHours(professionalId, hours).subscribe({
      next: () => {
        this.alertService.showSuccess('Horarios actualizados correctamente');
        this.closeModals();
        this.loadProfessionalsByCompany();
        this.savingHours.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar horarios');
        this.savingHours.set(false);
      },
    });
  }

  // ── Delete ──

  confirmDelete(): void {
    const selected = this.selectedItem();
    if (!selected) return;

    this.api.delete(selected['Id']).subscribe({
      next: () => {
        this.alertService.showSuccess('Profesional eliminado correctamente');
        this.showDeleteConfirm.set(false);
        this.selectedItem.set(null);
        this.store.removeItem(selected['Id']);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al eliminar profesional');
        this.showDeleteConfirm.set(false);
      },
    });
  }

  // ── Data Loaders ──

  private loadCompanies(): void {
    this.loading.set(true);
    const userId = this.userStore.currentUser()?.id;

    if (userId) {
      this.companyApi.getPermissionsByUser(userId).pipe(
        map(res => (res.data ?? []).map((p: any) => p.Company).filter(Boolean))
      ).subscribe({
        next: (companies) => {
          this.companies.set(companies.map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name })));
          this.loading.set(false);
          this.autoSelectFirstCompany();
        },
        error: () => {
          this.companyApi.getAll().subscribe({
            next: (res) => {
              const list = res.data ?? [];
              this.companies.set(list.map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name })));
              this.loading.set(false);
              this.autoSelectFirstCompany();
            },
            error: () => this.loading.set(false),
          });
        },
      });
    } else {
      this.companyApi.getAll().subscribe({
        next: (res) => {
          const list = res.data ?? [];
          this.companies.set(list.map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name })));
          this.loading.set(false);
          this.autoSelectFirstCompany();
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private autoSelectFirstCompany(): void {
    const opts = this.companies();
    if (opts.length > 0 && !this.selectedCompanyId.value) {
      this.selectedCompanyId.setValue(opts[0].id);
    }
  }

  private loadProfessionalsByCompany(): void {
    const companyId = Number(this.selectedCompanyId.value);
    if (!companyId) return;
    this.loading.set(true);
    this.api.getByCompany(companyId).subscribe({
      next: (res) => {
        this.store.setItems(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.store.setItems([]);
        this.loading.set(false);
      },
    });
  }

  private loadServicesByCompany(): void {
    const companyId = Number(this.selectedCompanyId.value);
    if (!companyId) return;
    this.serviceApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const services = (res.data ?? []).map((s: any) => ({
          Id: s.Id,
          VcName: s.VcName,
          CompanyId: s.CompanyId,
        }));
        this.allServices.set(services);
      },
      error: () => this.allServices.set([]),
    });
  }

  private loadBranchRooms(): void {
    this.branchRoomApi.getAll().subscribe({
      next: (res) => {
        this.allBranchRooms.set(res.data ?? []);
      },
      error: () => this.allBranchRooms.set([]),
    });
  }
}
