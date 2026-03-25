import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BkSpinnerComponent, BkTabsComponent, BkButtonComponent, BkModalComponent, BkSelectComponent } from '@shared/ui';
import type { BkTabItem, BkSelectOption } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { FaqStore, TagFormComponent, FaqCategoryFormComponent, FaqFormComponent } from '@features/manage-faqs';
import type { TagFormOutput, FaqCategoryFormOutput, FaqFormOutput } from '@features/manage-faqs';
import { TagApiService } from '@entities/tag';
import type { Tag, CreateTagRequest } from '@entities/tag';
import { CategoryApiService } from '@entities/category';
import type { Category, CreateCategoryRequest } from '@entities/category';
import { FaqApiService } from '@entities/faq';
import type { CreateFaqRequest } from '@entities/faq';
import { CompanyApiService } from '@entities/company';
import { UserStore } from '@entities/user';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'bk-faqs-page',
  imports: [
    ReactiveFormsModule,
    BkSpinnerComponent, BkTabsComponent, BkButtonComponent,
    BkDataTableComponent, BkModalComponent, BkConfirmDialogComponent,
    BkSelectComponent,
    TagFormComponent, FaqCategoryFormComponent, FaqFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Preguntas Frecuentes</h1>
          <p class="bk-page__subtitle">Gestión de etiquetas, categorías y FAQs para el chatbot</p>
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
            @case ('etiquetas') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForTags" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
              </div>
              <bk-data-table
                [data]="filteredTags()"
                [columns]="tagColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus etiquetas"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
            @case ('categorias') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForCats" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
              </div>
              <bk-data-table
                [data]="filteredFaqCategories()"
                [columns]="categoryColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus categorías"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
            @case ('faqs') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForFaqs" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
                <bk-select label="Categoría" [formControl]="selectedCategoryIdForFaqs" placeholder="Todas las categorías"
                  [options]="categoryFilterOptions()" [searchable]="true" [showAllOption]="true" allOptionLabel="Todas las categorías" />
              </div>
              <bk-data-table
                [data]="filteredFaqs()"
                [columns]="faqColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus FAQs"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
          }
        }
      </div>

      <!-- Tag Create/Edit Modal -->
      <bk-modal [open]="showTagModal()" [title]="selectedItem() ? 'Editar Etiqueta' : 'Crear Etiqueta'" size="lg" (closed)="closeModals()">
        <bk-tag-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [defaultCompanyId]="selectedCompanyIdForTags.value ?? ''"
          (saved)="saveTag($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- FAQ Category Create/Edit Modal -->
      <bk-modal [open]="showCategoryModal()" [title]="selectedItem() ? 'Editar Categoría' : 'Crear Categoría'" size="lg" (closed)="closeModals()">
        <bk-faq-category-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [defaultCompanyId]="selectedCompanyIdForCats.value ?? ''"
          (saved)="saveFaqCategory($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- FAQ Create/Edit Modal -->
      <bk-modal [open]="showFaqModal()" [title]="selectedItem() ? 'Editar FAQ' : 'Crear FAQ'" size="lg" (closed)="closeModals()">
        <bk-faq-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [categoryOptions]="allFaqCategories()"
          [tagOptions]="tagSelectOptions()"
          [defaultCompanyId]="selectedCompanyIdForFaqs.value ?? ''"
          (saved)="saveFaq($event)"
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
export class FaqsPageComponent implements OnInit {
  protected store = inject(FaqStore);
  private tagApi = inject(TagApiService);
  private catApi = inject(CategoryApiService);
  private faqApi = inject(FaqApiService);
  private companyApi = inject(CompanyApiService);
  private alertService = inject(AlertService);
  private userStore = inject(UserStore);

  readonly activeTab = signal('etiquetas');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showTagModal = signal(false);
  readonly showCategoryModal = signal(false);
  readonly showFaqModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly selectedItem = signal<Record<string, any> | null>(null);

  readonly companies = signal<{ id: string; name: string }[]>([]);
  readonly allFaqCategories = signal<Category[]>([]);
  readonly allTags = signal<Tag[]>([]);

  readonly selectedCompanyIdForTags = new FormControl('');
  readonly selectedCompanyIdForCats = new FormControl('');
  readonly selectedCompanyIdForFaqs = new FormControl('');
  readonly selectedCategoryIdForFaqs = new FormControl('');
  readonly activeCategoryFilter = signal<string>('');
  readonly activeCompanyIdForFaqs = signal<string>('');

  readonly tabs: BkTabItem[] = [
    { id: 'etiquetas', label: 'Etiquetas' },
    { id: 'categorias', label: 'Categorías FAQs' },
    { id: 'faqs', label: 'FAQs' },
  ];

  readonly companySelectOptions = computed<BkSelectOption[]>(() =>
    this.companies().map(c => ({ value: c.id, label: c.name }))
  );

  readonly categoryFilterOptions = computed<BkSelectOption[]>(() => {
    const companyId = this.activeCompanyIdForFaqs();
    const cats = this.allFaqCategories();
    const filtered = companyId ? cats.filter(c => String(c.CompanyId) === companyId && c.BIsService === false) : cats.filter(c => c.BIsService === false);
    return filtered.map(c => ({ value: String(c.Id), label: c.VcName }));
  });

  readonly tagSelectOptions = computed<BkSelectOption[]>(() => {
    const companyId = this.activeCompanyIdForFaqs();
    const tags = this.allTags();
    const filtered = companyId ? tags.filter(t => String(t.CompanyId) === companyId) : tags;
    return filtered.map(t => ({ value: String(t.Id), label: t.VcName }));
  });

  readonly filteredTags = computed(() => {
    const companyId = this.selectedCompanyIdForTags.value;
    if (!companyId) return [];
    return this.store.tags().filter(t => String(t.CompanyId) === companyId);
  });

  readonly filteredFaqCategories = computed(() => {
    const companyId = this.selectedCompanyIdForCats.value;
    if (!companyId) return [];
    return this.store.faqCategories().filter(c => String(c.CompanyId) === companyId && c.BIsService === false);
  });

  readonly filteredFaqs = computed(() => {
    const items = this.store.items();
    const catId = this.activeCategoryFilter();
    if (!catId) return items;
    return items.filter(f => String(f.CategoryServiceId) === catId);
  });

  readonly createButtonLabel = computed(() => {
    switch (this.activeTab()) {
      case 'etiquetas': return 'Crear Etiqueta';
      case 'categorias': return 'Crear Categoría';
      case 'faqs': return 'Crear FAQ';
      default: return 'Crear';
    }
  });

  readonly deleteTitle = computed(() => {
    switch (this.activeTab()) {
      case 'etiquetas': return '¿Eliminar etiqueta?';
      case 'categorias': return '¿Eliminar categoría?';
      case 'faqs': return '¿Eliminar FAQ?';
      default: return '¿Eliminar?';
    }
  });

  readonly deleteMessage = computed(() => {
    switch (this.activeTab()) {
      case 'etiquetas': return 'Esta acción no se puede deshacer. Se eliminará la etiqueta.';
      case 'categorias': return 'Esta acción no se puede deshacer. Se eliminará la categoría y las FAQs asociadas podrían verse afectadas.';
      case 'faqs': return 'Esta acción no se puede deshacer. Se eliminará la pregunta frecuente.';
      default: return 'Esta acción no se puede deshacer.';
    }
  });

  readonly tagColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'CompanyName', label: 'Empresa', sortable: true },
  ];

  readonly categoryColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'CompanyName', label: 'Empresa', sortable: true },
  ];

  readonly faqColumns: DataTableColumn[] = [
    { key: 'VcQuestion', label: 'Pregunta', sortable: true },
    { key: 'VcAnswer', label: 'Respuesta', sortable: true },
    { key: 'TagsText', label: 'Etiquetas' },
  ];

  ngOnInit(): void {
    this.loadCompanies();

    this.selectedCompanyIdForTags.valueChanges.subscribe(() => this.loadTagsByCompany());

    this.selectedCompanyIdForCats.valueChanges.subscribe(() => this.loadFaqCategoriesByCompany());

    this.selectedCompanyIdForFaqs.valueChanges.subscribe(v => {
      this.activeCompanyIdForFaqs.set(v ?? '');
      this.selectedCategoryIdForFaqs.setValue('', { emitEvent: false });
      this.activeCategoryFilter.set('');
      this.loadFaqsByCompany();
      this.loadTagsForFaqForm();
    });

    this.selectedCategoryIdForFaqs.valueChanges.subscribe(v => {
      this.activeCategoryFilter.set(v ?? '');
    });
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
    const opts = this.companies();
    if (opts.length > 0) {
      const firstId = opts[0].id;
      if (tabId === 'etiquetas') {
        if (!this.selectedCompanyIdForTags.value) {
          this.selectedCompanyIdForTags.setValue(firstId);
        } else {
          this.loadTagsByCompany();
        }
      }
      if (tabId === 'categorias') {
        if (!this.selectedCompanyIdForCats.value) {
          this.selectedCompanyIdForCats.setValue(firstId);
        } else {
          this.loadFaqCategoriesByCompany();
        }
      }
      if (tabId === 'faqs') {
        if (!this.selectedCompanyIdForFaqs.value) {
          this.selectedCompanyIdForFaqs.setValue(firstId);
        } else {
          this.loadFaqsByCompany();
        }
      }
    }
  }

  openCreate(): void {
    this.selectedItem.set(null);
    switch (this.activeTab()) {
      case 'etiquetas': this.showTagModal.set(true); break;
      case 'categorias': this.showCategoryModal.set(true); break;
      case 'faqs': this.showFaqModal.set(true); break;
    }
  }

  onEdit(row: Record<string, any>): void {
    this.selectedItem.set(row);
    switch (this.activeTab()) {
      case 'etiquetas': this.showTagModal.set(true); break;
      case 'categorias': this.showCategoryModal.set(true); break;
      case 'faqs': this.showFaqModal.set(true); break;
    }
  }

  onDelete(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showDeleteConfirm.set(true);
  }

  closeModals(): void {
    this.showTagModal.set(false);
    this.showCategoryModal.set(false);
    this.showFaqModal.set(false);
    this.selectedItem.set(null);
  }

  // ── Tag CRUD ──

  saveTag(output: TagFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const companyId = Number(output.companyId);

    if (!companyId) {
      this.alertService.showError('Seleccione una empresa');
      this.saving.set(false);
      return;
    }

    const payload: CreateTagRequest = {
      CompanyId: companyId,
      VcName: output.formValue.VcName,
    };

    const obs = selected
      ? this.tagApi.update(selected['Id'], payload)
      : this.tagApi.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Etiqueta actualizada correctamente' : 'Etiqueta creada correctamente');
        this.closeModals();
        this.loadTagsByCompany();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar etiqueta');
        this.saving.set(false);
      },
    });
  }

  // ── FAQ Category CRUD ──

  saveFaqCategory(output: FaqCategoryFormOutput): void {
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
      BIsService: false,
    };

    const obs = selected
      ? this.catApi.update(selected['Id'], payload)
      : this.catApi.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
        this.closeModals();
        this.loadFaqCategoriesByCompany();
        this.loadAllFaqCategories();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar categoría');
        this.saving.set(false);
      },
    });
  }

  // ── FAQ CRUD ──

  saveFaq(output: FaqFormOutput): void {
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

    const payload: CreateFaqRequest = {
      CompanyId: companyId,
      CategoryServiceId: categoryId,
      VcQuestion: output.formValue.VcQuestion,
      VcAnswer: output.formValue.VcAnswer,
      TagIds: output.tagIds,
    };

    const obs = selected
      ? this.faqApi.update(selected['Id'], payload)
      : this.faqApi.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'FAQ actualizada correctamente' : 'FAQ creada correctamente');
        this.closeModals();
        this.loadFaqsByCompany();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar FAQ');
        this.saving.set(false);
      },
    });
  }

  // ── Delete ──

  confirmDelete(): void {
    const selected = this.selectedItem();
    if (!selected) return;

    switch (this.activeTab()) {
      case 'etiquetas':
        this.tagApi.delete(selected['Id']).subscribe({
          next: () => {
            this.alertService.showSuccess('Etiqueta eliminada correctamente');
            this.showDeleteConfirm.set(false);
            this.selectedItem.set(null);
            this.loadTagsByCompany();
          },
          error: (err) => {
            this.alertService.showError(err.message || 'Error al eliminar etiqueta');
            this.showDeleteConfirm.set(false);
          },
        });
        break;
      case 'categorias':
        this.catApi.delete(selected['Id']).subscribe({
          next: () => {
            this.alertService.showSuccess('Categoría eliminada correctamente');
            this.showDeleteConfirm.set(false);
            this.selectedItem.set(null);
            this.loadFaqCategoriesByCompany();
            this.loadAllFaqCategories();
          },
          error: (err) => {
            this.alertService.showError(err.message || 'Error al eliminar categoría');
            this.showDeleteConfirm.set(false);
          },
        });
        break;
      case 'faqs':
        this.faqApi.delete(selected['Id']).subscribe({
          next: () => {
            this.alertService.showSuccess('FAQ eliminada correctamente');
            this.showDeleteConfirm.set(false);
            this.selectedItem.set(null);
            this.loadFaqsByCompany();
          },
          error: (err) => {
            this.alertService.showError(err.message || 'Error al eliminar FAQ');
            this.showDeleteConfirm.set(false);
          },
        });
        break;
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
          this.loadAllFaqCategories();
          this.autoSelectFirstCompany();
        },
        error: () => {
          this.companyApi.getAll().subscribe({
            next: (res) => {
              const list = res.data ?? [];
              this.companies.set(list.map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name })));
              this.loading.set(false);
              this.loadAllFaqCategories();
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
          this.loadAllFaqCategories();
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
      if (this.activeTab() === 'etiquetas' && !this.selectedCompanyIdForTags.value) {
        this.selectedCompanyIdForTags.setValue(firstId);
      }
      if (this.activeTab() === 'categorias' && !this.selectedCompanyIdForCats.value) {
        this.selectedCompanyIdForCats.setValue(firstId);
      }
      if (this.activeTab() === 'faqs' && !this.selectedCompanyIdForFaqs.value) {
        this.selectedCompanyIdForFaqs.setValue(firstId);
      }
    }
  }

  private loadAllFaqCategories(): void {
    this.catApi.getAll().subscribe({
      next: (res) => this.allFaqCategories.set((res.data ?? []).filter(c => c.BIsService === false)),
      error: () => {},
    });
  }

  private loadTagsByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForTags.value);
    if (!companyId) return;
    this.loading.set(true);
    this.tagApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const tags = (res.data ?? []).map((t: any) => ({
          ...t,
          CompanyName: this.getCompanyName(t.CompanyId),
        }));
        this.store.setTags(tags);
        this.loading.set(false);
      },
      error: () => {
        this.store.setTags([]);
        this.loading.set(false);
      },
    });
  }

  private loadFaqCategoriesByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForCats.value);
    if (!companyId) return;
    this.loading.set(true);
    this.catApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const cats = (res.data ?? [])
          .filter((c: any) => c.BIsService === false)
          .map((c: any) => ({
            ...c,
            CompanyName: this.getCompanyName(c.CompanyId),
          }));
        this.store.setFaqCategories(cats);
        this.loading.set(false);
      },
      error: () => {
        this.store.setFaqCategories([]);
        this.loading.set(false);
      },
    });
  }

  private loadFaqsByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForFaqs.value);
    if (!companyId) return;
    this.loading.set(true);
    this.faqApi.getByCompany(companyId).subscribe({
      next: (res) => {
        const faqs = (res.data ?? []).map((f: any) => ({
          ...f,
          CategoryName: f.CategoryService?.VcName ?? '',
          TagsText: (f.FaqsTags ?? []).map((ft: any) => ft.Tag?.VcName).filter(Boolean).join(', '),
        }));
        this.store.setItems(faqs);
        this.loading.set(false);
      },
      error: () => {
        this.store.setItems([]);
        this.loading.set(false);
      },
    });
  }

  private loadTagsForFaqForm(): void {
    const companyId = Number(this.selectedCompanyIdForFaqs.value);
    if (!companyId) return;
    this.tagApi.getByCompany(companyId).subscribe({
      next: (res) => this.allTags.set(res.data ?? []),
      error: () => this.allTags.set([]),
    });
  }

  private getCompanyName(companyId: number): string {
    const company = this.companies().find(c => c.id === String(companyId));
    return company?.name ?? '';
  }
}
