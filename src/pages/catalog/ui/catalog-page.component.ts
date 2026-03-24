import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { BkSpinnerComponent, BkTabsComponent, BkButtonComponent, BkModalComponent } from '@shared/ui';
import type { BkTabItem } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { CatalogStore } from '@features/manage-catalog';
import { CategoryApiService } from '@entities/category';
import { ServiceApiService } from '@entities/service';

@Component({
  standalone: true,
  selector: 'bk-catalog-page',
  imports: [BkSpinnerComponent, BkTabsComponent, BkButtonComponent, BkDataTableComponent, BkModalComponent, BkConfirmDialogComponent],
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
          {{ activeTab() === 'categorias' ? 'Crear Categoría' : 'Crear Servicio' }}
        </bk-button>
      </div>

      <bk-tabs
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
      />

      <div class="bk-page__content">
        @if (store.loading()) {
          <div class="bk-page__loader"><bk-spinner /></div>
        } @else {
          @if (activeTab() === 'categorias') {
            <bk-data-table
              [data]="store.categories()"
              [columns]="categoryColumns"
              trackByKey="InId"
              emptyMessage="No hay categorías registradas"
              (editClicked)="onEdit($event)"
              (deleteClicked)="onDelete($event)"
            />
          } @else {
            <bk-data-table
              [data]="store.services()"
              [columns]="serviceColumns"
              trackByKey="InId"
              emptyMessage="No hay servicios registrados"
              (editClicked)="onEdit($event)"
              (deleteClicked)="onDelete($event)"
            />
          }
        }
      </div>

      <bk-modal [open]="showCreateForm()" [title]="activeTab() === 'categorias' ? 'Crear Categoría' : 'Crear Servicio'" (closed)="showCreateForm.set(false)">
        <p class="bk-page__placeholder">Formulario de creación — en desarrollo</p>
        <bk-button variant="secondary" size="md" (clicked)="showCreateForm.set(false)">Cerrar</bk-button>
      </bk-modal>

      <bk-modal [open]="showEditForm()" [title]="activeTab() === 'categorias' ? 'Editar Categoría' : 'Editar Servicio'" (closed)="showEditForm.set(false)">
        <p class="bk-page__placeholder">Formulario de edición — en desarrollo</p>
        <bk-button variant="secondary" size="md" (clicked)="showEditForm.set(false)">Cerrar</bk-button>
      </bk-modal>

      <bk-confirm-dialog
        [open]="showDeleteConfirm()"
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer."
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
    .bk-page__placeholder { font-size: var(--bk-font-size-sm, 12px); color: var(--bk-color-text-muted); margin-bottom: 16px; }
  `],
})
export class CatalogPageComponent implements OnInit {
  protected store = inject(CatalogStore);
  private catApi = inject(CategoryApiService);
  private svcApi = inject(ServiceApiService);
  private alertService = inject(AlertService);

  readonly showCreateForm = signal(false);
  readonly showEditForm = signal(false);
  readonly showDeleteConfirm = signal(false);
  private selectedItem = signal<Record<string, any> | null>(null);

  readonly tabs: BkTabItem[] = [
    { id: 'categorias', label: 'Categorías' },
    { id: 'servicios', label: 'Servicios' },
  ];

  readonly activeTab = signal('categorias');

  readonly categoryColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'VcDescription', label: 'Descripción' },
  ];

  readonly serviceColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'InDuration', label: 'Duración (min)', sortable: true },
    { key: 'DcPrice', label: 'Precio', sortable: true },
  ];

  ngOnInit(): void {
    this.store.setLoading(true);
    this.catApi.getAll().subscribe({
      next: (res) => this.store.setCategories(res.data ?? []),
      error: () => {},
    });
    this.svcApi.getAll().subscribe({
      next: (res) => {
        this.store.setServices(res.data ?? []);
        this.store.setLoading(false);
      },
      error: () => this.store.setLoading(false),
    });
  }

  openCreate(): void {
    this.showCreateForm.set(true);
  }

  onEdit(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showEditForm.set(true);
  }

  onDelete(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(false);
    this.alertService.showInfo('Eliminación no implementada aún');
  }
}
