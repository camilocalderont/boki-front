import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { BkSpinnerComponent, BkButtonComponent, BkModalComponent } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { PlanStore } from '@features/manage-plans';

@Component({
  standalone: true,
  selector: 'bk-plans-page',
  imports: [BkSpinnerComponent, BkButtonComponent, BkDataTableComponent, BkModalComponent, BkConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Planes</h1>
          <p class="bk-page__subtitle">Planes de suscripción disponibles</p>
        </div>
        <bk-button variant="primary" size="md" (clicked)="openCreate()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Plan
        </bk-button>
      </div>

      @if (store.loading()) {
        <div class="bk-page__loader"><bk-spinner /></div>
      } @else {
        <bk-data-table
          [data]="store.items()"
          [columns]="columns"
          trackByKey="InId"
          emptyMessage="No hay planes registrados"
          (editClicked)="onEdit($event)"
          (deleteClicked)="onDelete($event)"
        />
      }

      <bk-modal [open]="showCreateForm()" title="Crear Plan" (closed)="showCreateForm.set(false)">
        <p class="bk-page__placeholder">Formulario de creación — en desarrollo</p>
        <bk-button variant="secondary" size="md" (clicked)="showCreateForm.set(false)">Cerrar</bk-button>
      </bk-modal>

      <bk-modal [open]="showEditForm()" title="Editar Plan" (closed)="showEditForm.set(false)">
        <p class="bk-page__placeholder">Formulario de edición — en desarrollo</p>
        <bk-button variant="secondary" size="md" (clicked)="showEditForm.set(false)">Cerrar</bk-button>
      </bk-modal>

      <bk-confirm-dialog
        [open]="showDeleteConfirm()"
        title="¿Eliminar plan?"
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
    .bk-page__loader { display: flex; justify-content: center; padding: 48px; }
    .bk-page__placeholder { font-size: var(--bk-font-size-sm, 12px); color: var(--bk-color-text-muted); margin-bottom: 16px; }
  `],
})
export class PlansPageComponent {
  protected store = inject(PlanStore);
  private alertService = inject(AlertService);

  readonly showCreateForm = signal(false);
  readonly showEditForm = signal(false);
  readonly showDeleteConfirm = signal(false);
  private selectedItem = signal<Record<string, any> | null>(null);

  readonly columns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'DcPrice', label: 'Precio', sortable: true },
    { key: 'InMaxUsers', label: 'Usuarios Max', sortable: true },
  ];

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
