import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BkSpinnerComponent, BkTabsComponent, BkButtonComponent, BkModalComponent, BkSelectComponent } from '@shared/ui';
import type { BkTabItem, BkSelectOption } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { CatalogStore, CategoryFormComponent, ServiceFormComponent, ServiceStagesFormComponent } from '@features/manage-catalog';
import type { CategoryFormOutput, ServiceFormOutput } from '@features/manage-catalog';
import { CategoryApiService } from '@entities/category';
import type { Category, CreateCategoryRequest } from '@entities/category';
import { ServiceApiService } from '@entities/service';
import type { CreateServiceRequest } from '@entities/service';
import { CompanyApiService } from '@entities/company';
import { UserStore } from '@entities/user';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'bk-catalog-page',
  imports: [
    ReactiveFormsModule,
    BkSpinnerComponent, BkTabsComponent, BkButtonComponent,
    BkDataTableComponent, BkModalComponent, BkConfirmDialogComponent,
    BkSelectComponent,
    CategoryFormComponent, ServiceFormComponent, ServiceStagesFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Catálogo</h1>
          <p class="bk-page__subtitle">Gestión de categorías y servicios</p>
        </div>
        <bk-button variant="primary" size="md" (clicked)="openCreate()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ createButtonLabel() }}
        </bk-button>
      </div>

      <bk-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)" />

      <div class="bk-page__content">
        @if (loading()) {
          <div class="bk-page__loader"><bk-spinner /></div>
        } @else {
          @switch (activeTab()) {
            @case ('categorias') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForCats" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
              </div>
              <bk-data-table
                [data]="filteredCategories()"
                [columns]="categoryColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus categorías"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
            @case ('servicios') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForSvcs" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
                <bk-select label="Categoría" [formControl]="selectedCategoryIdForSvcs" placeholder="Todas las categorías"
                  [options]="categoryFilterOptions()" [searchable]="true" [showAllOption]="true" allOptionLabel="Todas las categorías" />
              </div>
              <bk-data-table
                [data]="filteredServices()"
                [columns]="serviceColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                [showStagesAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus servicios"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
                (stagesClicked)="onStages($event)"
              />
            }
          }
        }
      </div>

      <!-- Category Create/Edit Modal -->
      <bk-modal [open]="showCategoryModal()" [title]="selectedItem() ? 'Editar Categoría' : 'Crear Categoría'" size="lg" (closed)="closeModals()">
        <bk-category-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [defaultCompanyId]="selectedCompanyIdForCats.value ?? ''"
          (saved)="saveCategory($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- Service Create/Edit Modal -->
      <bk-modal [open]="showServiceModal()" [title]="selectedItem() ? 'Editar Servicio' : 'Crear Servicio'" size="lg" (closed)="closeModals()">
        <bk-service-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [categoryOptions]="allCategories()"
          [defaultCompanyId]="selectedCompanyIdForSvcs.value ?? ''"
          [defaultCategoryId]="selectedCategoryIdForSvcs.value ?? ''"
          (saved)="saveService($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- Delete Confirmation -->
      <bk-confirm-dialog
        [open]="showDeleteConfirm()"
        [title]="deleteTitle()"
        [message]="deleteMessage()"
        confirmLabel="Eliminar"
        variant="danger"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteConfirm.set(false)"
      />

      <!-- Service Stages Modal -->
      <bk-modal [open]="showStagesModal()" title="Etapas del Servicio" size="xl" (closed)="closeStagesModal()">
        @if (selectedServiceForStages()) {
          <bk-service-stages-form
            [existingStages]="stagesData()"
            [serviceTime]="selectedServiceForStages()?.['VcTime'] ?? '00:00'"
            [loading]="savingStages()"
            (saved)="saveStages($event)"
            (cancelled)="closeStagesModal()"
          />
        }
      </bk-modal>
    </div>
  `,
  styles: [`
    .bk-page { padding: 24px 0; }
    .bk-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
    .bk-page__title { font-size: var(--bk-font-size-xl, 20px); font-weight: 600; color: var(--bk-color-text-primary); margin: 0; line-height: 1.3; }
    .bk-page__subtitle { font-size: var(--bk-font-size-sm, 12px); color: var(--bk-color-text-muted); margin-top: 4px; }
    .bk-page__content { margin-top: 20px; }
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
  `],
})
export class CatalogPageComponent implements OnInit {
  protected store = inject(CatalogStore);
  private catApi = inject(CategoryApiService);
  private svcApi = inject(ServiceApiService);
  private companyApi = inject(CompanyApiService);
  private alertService = inject(AlertService);
  private userStore = inject(UserStore);

  readonly activeTab = signal('categorias');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showCategoryModal = signal(false);
  readonly showServiceModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly showStagesModal = signal(false);
  readonly selectedItem = signal<Record<string, any> | null>(null);
  readonly selectedServiceForStages = signal<Record<string, any> | null>(null);
  readonly savingStages = signal(false);
  readonly stagesData = signal<any[]>([]);

  readonly companies = signal<{ id: string; name: string }[]>([]);
  readonly allCategories = signal<Category[]>([]);

  readonly selectedCompanyIdForCats = new FormControl('');
  readonly selectedCompanyIdForSvcs = new FormControl('');
  readonly selectedCategoryIdForSvcs = new FormControl('');
  readonly activeCompanyIdForSvcs = signal<string>('');
  readonly activeCategoryFilter = signal<string>('');

  readonly tabs: BkTabItem[] = [
    { id: 'categorias', label: 'Categorías' },
    { id: 'servicios', label: 'Servicios' },
  ];

  readonly companySelectOptions = computed<BkSelectOption[]>(() =>
    this.companies().map(c => ({ value: c.id, label: c.name }))
  );

  readonly categoryFilterOptions = computed<BkSelectOption[]>(() => {
    const companyId = this.activeCompanyIdForSvcs();
    const cats = this.allCategories();
    const filtered = companyId ? cats.filter(c => String(c.CompanyId) === companyId) : cats;
    return filtered.map(c => ({ value: String(c.Id), label: c.VcName }));
  });

  readonly filteredCategories = computed(() => this.store.categories());

  readonly filteredServices = computed(() => {
    const items = this.store.services();
    const catId = this.activeCategoryFilter();
    if (!catId) return items;
    return items.filter(s => String(s.CategoryId) === catId);
  });

  readonly createButtonLabel = computed(() =>
    this.activeTab() === 'categorias' ? 'Crear Categoría' : 'Crear Servicio'
  );

  readonly deleteTitle = computed(() =>
    this.activeTab() === 'categorias' ? '¿Eliminar categoría?' : '¿Eliminar servicio?'
  );

  readonly deleteMessage = computed(() =>
    this.activeTab() === 'categorias'
      ? 'Esta acción no se puede deshacer. Se eliminará la categoría y los servicios asociados podrían verse afectados.'
      : 'Esta acción no se puede deshacer. Se eliminará el servicio.'
  );

  readonly categoryColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'CompanyName', label: 'Empresa', sortable: true },
  ];

  readonly serviceColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'CategoryName', label: 'Categoría', sortable: true },
    { key: 'VcTime', label: 'Duración', sortable: true },
    { key: 'IRegularPrice', label: 'Precio', sortable: true },
  ];

  ngOnInit(): void {
    this.loadCompanies();

    this.selectedCompanyIdForCats.valueChanges.subscribe(() => this.loadCategoriesByCompany());

    this.selectedCompanyIdForSvcs.valueChanges.subscribe(v => {
      this.activeCompanyIdForSvcs.set(v ?? '');
      this.selectedCategoryIdForSvcs.setValue('', { emitEvent: false });
      this.activeCategoryFilter.set('');
      this.loadServicesByCompany();
    });

    this.selectedCategoryIdForSvcs.valueChanges.subscribe(v => {
      this.activeCategoryFilter.set(v ?? '');
    });
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
    const opts = this.companies();
    if (opts.length > 0) {
      const firstId = opts[0].id;
      if (tabId === 'categorias') {
        if (!this.selectedCompanyIdForCats.value) {
          this.selectedCompanyIdForCats.setValue(firstId);
        } else {
          this.loadCategoriesByCompany();
        }
      }
      if (tabId === 'servicios') {
        if (!this.selectedCompanyIdForSvcs.value) {
          this.selectedCompanyIdForSvcs.setValue(firstId);
        } else {
          this.loadServicesByCompany();
        }
      }
    }
  }

  openCreate(): void {
    this.selectedItem.set(null);
    if (this.activeTab() === 'categorias') {
      this.showCategoryModal.set(true);
    } else {
      this.showServiceModal.set(true);
    }
  }

  onEdit(row: Record<string, any>): void {
    this.selectedItem.set(row);
    if (this.activeTab() === 'categorias') {
      this.showCategoryModal.set(true);
    } else {
      this.showServiceModal.set(true);
    }
  }

  onDelete(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showDeleteConfirm.set(true);
  }

  closeModals(): void {
    this.showCategoryModal.set(false);
    this.showServiceModal.set(false);
    this.selectedItem.set(null);
  }

  // ── Service Stages ──

  onStages(row: Record<string, any>): void {
    this.selectedServiceForStages.set(row);
    this.stagesData.set(row['ServiceStages'] ?? []);
    this.showStagesModal.set(true);
  }

  closeStagesModal(): void {
    this.showStagesModal.set(false);
    this.selectedServiceForStages.set(null);
    this.stagesData.set([]);
  }

  saveStages(stages: any[]): void {
    const service = this.selectedServiceForStages();
    if (!service) return;
    this.savingStages.set(true);
    this.svcApi.updateServiceStages(service['Id'], stages).subscribe({
      next: () => {
        this.alertService.showSuccess('Etapas actualizadas correctamente');
        this.closeStagesModal();
        this.loadServicesByCompany();
        this.savingStages.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar etapas');
        this.savingStages.set(false);
      },
    });
  }

  // ── Category CRUD ──

  saveCategory(output: CategoryFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const companyId = Number(output.companyId);

    if (!companyId) {
      this.alertService.showError('Seleccione una empresa');
      this.saving.set(false);
      return;
    }

    const payload: CreateCategoryRequest = {
      CompanyId: companyId,
      VcName: output.formValue.VcName,
      BIsService: output.formValue.BIsService,
    };

    const obs = selected
      ? this.catApi.update(selected['Id'], payload)
      : this.catApi.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
        this.closeModals();
        this.loadCategoriesByCompany();
        this.loadAllCategories();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar categoría');
        this.saving.set(false);
      },
    });
  }

  // ── Service CRUD ──

  saveService(output: ServiceFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const companyId = Number(output.companyId);
    const categoryId = Number(output.categoryId);

    if (!companyId) {
      this.alertService.showError('Seleccione una empresa');
      this.saving.set(false);
      return;
    }
    if (!categoryId) {
      this.alertService.showError('Seleccione una categoría');
      this.saving.set(false);
      return;
    }

    const payload: CreateServiceRequest = {
      CompanyId: companyId,
      CategoryId: categoryId,
      VcName: output.formValue.VcName,
      VcDescription: output.formValue.VcDescription,
      IMinimalPrice: Number(output.formValue.IMinimalPrice),
      IMaximalPrice: Number(output.formValue.IMaximalPrice),
      IRegularPrice: Number(output.formValue.IRegularPrice),
      VcTime: output.formValue.VcTime,
    };

    const obs = selected
      ? this.svcApi.update(selected['Id'], payload)
      : this.svcApi.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
        this.closeModals();
        this.loadServicesByCompany();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar servicio');
        this.saving.set(false);
      },
    });
  }

  // ── Delete ──

  confirmDelete(): void {
    const selected = this.selectedItem();
    if (!selected) return;

    if (this.activeTab() === 'categorias') {
      this.catApi.delete(selected['Id']).subscribe({
        next: () => {
          this.alertService.showSuccess('Categoría eliminada correctamente');
          this.showDeleteConfirm.set(false);
          this.selectedItem.set(null);
          this.loadCategoriesByCompany();
          this.loadAllCategories();
        },
        error: (err) => {
          this.alertService.showError(err.message || 'Error al eliminar categoría');
          this.showDeleteConfirm.set(false);
        },
      });
    } else {
      this.svcApi.delete(selected['Id']).subscribe({
        next: () => {
          this.alertService.showSuccess('Servicio eliminado correctamente');
          this.showDeleteConfirm.set(false);
          this.selectedItem.set(null);
          this.loadServicesByCompany();
        },
        error: (err) => {
          this.alertService.showError(err.message || 'Error al eliminar servicio');
          this.showDeleteConfirm.set(false);
        },
      });
    }
  }

  // ── Data loaders ──

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
          this.loadAllCategories();
          this.autoSelectFirstCompany();
        },
        error: () => {
          this.companyApi.getAll().subscribe({
            next: (res) => {
              const list = res.data ?? [];
              this.companies.set(list.map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name })));
              this.loading.set(false);
              this.loadAllCategories();
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
          this.loadAllCategories();
          this.autoSelectFirstCompany();
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private autoSelectFirstCompany(): void {
    const opts = this.companies();
    if (opts.length > 0) {
      const firstId = opts[0].id;
      if (this.activeTab() === 'categorias' && !this.selectedCompanyIdForCats.value) {
        this.selectedCompanyIdForCats.setValue(firstId);
      }
      if (this.activeTab() === 'servicios' && !this.selectedCompanyIdForSvcs.value) {
        this.selectedCompanyIdForSvcs.setValue(firstId);
      }
    }
  }

  private loadAllCategories(): void {
    this.catApi.getAll().subscribe({
      next: (res) => this.allCategories.set(res.data ?? []),
      error: () => {},
    });
  }

  private loadCategoriesByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForCats.value);
    if (!companyId) return;
    this.loading.set(true);
    this.catApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const cats = (res.data ?? []).map((c: any) => ({
          ...c,
          CompanyName: this.getCompanyName(c.CompanyId),
        }));
        this.store.setCategories(cats);
        this.loading.set(false);
      },
      error: () => {
        this.store.setCategories([]);
        this.loading.set(false);
      },
    });
  }

  private loadServicesByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForSvcs.value);
    if (!companyId) return;
    this.loading.set(true);
    this.svcApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const svcs = (res.data ?? []).map((s: any) => ({
          ...s,
          CategoryName: s.Category?.VcName ?? '',
        }));
        this.store.setServices(svcs);
        this.loading.set(false);
      },
      error: () => {
        this.store.setServices([]);
        this.loading.set(false);
      },
    });
  }

  private getCompanyName(companyId: number): string {
    const company = this.companies().find(c => c.id === String(companyId));
    return company?.name ?? '';
  }
}
