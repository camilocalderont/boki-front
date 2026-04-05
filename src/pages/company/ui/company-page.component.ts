import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { BkSpinnerComponent, BkTabsComponent, BkButtonComponent, BkModalComponent, BkSelectComponent, BkCardComponent, BkInputComponent, BkFileUploadComponent, BkIconComponent } from '@shared/ui';
import type { BkTabItem, BkSelectOption } from '@shared/ui';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import { AlertService } from '@shared/lib';
import { CompanyStore, CompanyFormComponent, BranchFormComponent } from '@features/manage-company';
import type { BranchFormOutput } from '@features/manage-company';
import { BranchRoomStore, BranchRoomFormComponent } from '@features/manage-branch-room';
import type { BranchRoomFormOutput } from '@features/manage-branch-room';
import { CompanyApiService, StorageApiService } from '@entities/company';
import type { CompanyFormValue, BranchFormValue, CompanyGalleryImage, GalleryCategory } from '@entities/company';
import { BranchRoomApiService } from '@entities/branch-room';
import { ServiceApiService } from '@entities/service';
import type { ServiceEntity } from '@entities/service';
import { UserStore } from '@entities/user';
import { CompanyBranchService, CompanyBranch } from '@app/services/company-branch.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map, forkJoin, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'bk-company-page',
  imports: [
    ReactiveFormsModule,
    BkSpinnerComponent, BkTabsComponent, BkButtonComponent,
    BkDataTableComponent, BkModalComponent, BkConfirmDialogComponent,
    BkSelectComponent, BkCardComponent, BkInputComponent,
    BkFileUploadComponent, BkIconComponent,
    CompanyFormComponent, BranchFormComponent, BranchRoomFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Empresas</h1>
          <p class="bk-page__subtitle">Gestión de datos de empresa, sedes y consultorios</p>
        </div>
        @if (activeTab() !== 'galeria') {
          <bk-button variant="primary" size="md" (clicked)="openCreate()">
            <bk-icon name="plus" size="sm" />
            {{ createButtonLabel() }}
          </bk-button>
        }
      </div>

      <bk-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)" />

      <div class="bk-page__content">
        @if (loading()) {
          <div class="bk-page__loader"><bk-spinner /></div>
        } @else {
          @switch (activeTab()) {
            @case ('datos') {
              <bk-data-table
                [data]="store.items()"
                [columns]="companyColumns"
                [showActions]="true"
                [showDeleteAction]="false"
                trackByKey="Id"
                emptyMessage="No hay empresas registradas"
                (editClicked)="onEdit($event)"
              />
            }
            @case ('sedes') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyId" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
              </div>
              <bk-data-table
                [data]="branches()"
                [columns]="branchColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus sedes"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
            @case ('consultorios') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForRooms" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
                <bk-select label="Sede" [formControl]="selectedBranchIdForRooms" placeholder="Todas las sedes"
                  [options]="branchSelectOptions()" [searchable]="true" [showAllOption]="true" allOptionLabel="Todas las sedes" />
              </div>
              <bk-data-table
                [data]="filteredRooms()"
                [columns]="roomColumns"
                [showActions]="true"
                [showDeleteAction]="true"
                trackByKey="Id"
                emptyMessage="Seleccione una empresa para ver sus consultorios"
                (editClicked)="onEdit($event)"
                (deleteClicked)="onDelete($event)"
              />
            }
            @case ('galeria') {
              <div class="bk-page__filter-bar">
                <bk-select label="Empresa" [formControl]="selectedCompanyIdForGallery" placeholder="Seleccione una empresa"
                  [options]="companySelectOptions()" [searchable]="true" />
              </div>

              @if (selectedCompanyIdForGallery.value) {
                <!-- Internal tabs: Establecimiento / Servicios -->
                <div class="bk-gallery-tabs">
                  <button
                    class="bk-gallery-tab"
                    [class.bk-gallery-tab--active]="galleryTab() === 'venue'"
                    (click)="galleryTab.set('venue')"
                    type="button"
                  >Establecimiento ({{ venueImages().length }})</button>
                  <button
                    class="bk-gallery-tab"
                    [class.bk-gallery-tab--active]="galleryTab() === 'service'"
                    (click)="galleryTab.set('service')"
                    type="button"
                  >Servicios ({{ serviceImages().length }})</button>
                </div>

                <bk-card>
                  <h3 class="bk-gallery-form__title">
                    Agregar imagen — {{ galleryTab() === 'venue' ? 'Establecimiento' : 'Servicios' }}
                  </h3>
                  <form [formGroup]="galleryForm" (ngSubmit)="addGalleryImage()" class="bk-gallery-form-v2">
                    <bk-file-upload
                      #galleryUploader
                      class="bk-gallery-form-v2__uploader"
                      (fileSelected)="onGalleryFileSelected($event)"
                      (fileError)="onGalleryFileError($event)"
                      (fileRemoved)="onGalleryFileRemoved()"
                    />
                    <div class="bk-gallery-form-v2__meta">
                      @if (galleryTab() === 'service') {
                        <bk-select
                          label="Servicio"
                          formControlName="ServiceId"
                          placeholder="Selecciona un servicio"
                          [options]="serviceSelectOptions()"
                          [searchable]="true"
                        />
                      }
                      <bk-input
                        label="Descripción (opcional)"
                        placeholder="Descripción de la imagen"
                        formControlName="VcDescription"
                      />
                      <bk-button
                        type="submit"
                        variant="primary"
                        size="md"
                        [disabled]="!selectedFile() || savingGallery() || (galleryTab() === 'service' && !galleryForm.get('ServiceId')?.value)"
                      >
                        @if (savingGallery()) {
                          <bk-spinner />
                        } @else {
                          Subir imagen
                        }
                      </bk-button>
                    </div>
                  </form>
                </bk-card>

                <div class="bk-gallery-grid">
                  @if (galleryLoading()) {
                    <div class="bk-page__loader"><bk-spinner /></div>
                  } @else {
                    @let activeImages = galleryTab() === 'venue' ? venueImages() : serviceImages();
                    @if (activeImages.length === 0) {
                      <p class="bk-gallery-empty">No hay imágenes en esta categoría. Agrega la primera imagen arriba.</p>
                    } @else {
                      @for (image of activeImages; track image.Id) {
                        <div class="bk-gallery-item">
                          <img [src]="image.VcImageUrl" [alt]="image.VcDescription || 'Imagen de galería'" class="bk-gallery-item__img" />
                          <div class="bk-gallery-item__overlay">
                            @if (image.VcDescription) {
                              <p class="bk-gallery-item__desc">{{ image.VcDescription }}</p>
                            }
                            <button class="bk-gallery-item__delete" type="button" (click)="confirmDeleteGalleryImage(image)">
                              <bk-icon name="trash" size="sm" class="text-red-500" />
                            </button>
                          </div>
                        </div>
                      }
                    }
                  }
                </div>
              }
            }
          }
        }
      </div>

      <!-- Company Create/Edit Modal -->
      <bk-modal [open]="showCompanyModal()" [title]="selectedItem() ? 'Editar Empresa' : 'Crear Empresa'" size="lg" (closed)="closeModals()">
        <bk-company-form
          [editData]="selectedItem()"
          [loading]="saving()"
          (saved)="saveCompany($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- Branch Create/Edit Modal -->
      <bk-modal [open]="showBranchModal()" [title]="selectedItem() ? 'Editar Sede' : 'Crear Sede'" size="lg" (closed)="closeModals()">
        <bk-branch-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [defaultCompanyId]="selectedCompanyId.value ?? ''"
          (saved)="saveBranch($event)"
          (cancelled)="closeModals()"
        />
      </bk-modal>

      <!-- BranchRoom Create/Edit Modal -->
      <bk-modal [open]="showRoomModal()" [title]="selectedItem() ? 'Editar Consultorio' : 'Crear Consultorio'" size="lg" (closed)="closeModals()">
        <bk-branch-room-form
          [editData]="selectedItem()"
          [loading]="saving()"
          [companyOptions]="companySelectOptions()"
          [branchOptions]="allBranches()"
          [defaultCompanyId]="selectedCompanyIdForRooms.value ?? ''"
          (saved)="saveRoom($event)"
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

      <!-- Gallery Image Delete Confirmation -->
      <bk-confirm-dialog
        [open]="showGalleryDeleteConfirm()"
        title="¿Eliminar imagen?"
        message="Esta acción no se puede deshacer. Se eliminará la imagen de la galería."
        confirmLabel="Eliminar"
        variant="danger"
        (confirm)="confirmDeleteGallery()"
        (cancel)="showGalleryDeleteConfirm.set(false)"
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

    /* Gallery form title */
    .bk-gallery-form__title { font-size: var(--bk-font-size-base, 14px); font-weight: 600; color: var(--bk-color-text-primary); margin: 0 0 16px; }

    /* Gallery tabs */
    .bk-gallery-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb); }
    .bk-gallery-tab { padding: 8px 16px; font-size: var(--bk-font-size-sm, 13px); font-weight: 500; color: var(--bk-color-text-secondary, #64748B); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: color 0.15s, border-color 0.15s; margin-bottom: -1px; }
    .bk-gallery-tab:hover { color: var(--bk-color-primary, #2563EB); }
    .bk-gallery-tab--active { color: var(--bk-color-primary, #2563EB); border-bottom-color: var(--bk-color-primary, #2563EB); font-weight: 600; }

    /* Gallery form v2 */
    .bk-gallery-form-v2 { display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: start; }
    .bk-gallery-form-v2__uploader { min-height: 120px; }
    .bk-gallery-form-v2__meta { display: flex; flex-direction: column; gap: 12px; }

    /* Gallery grid */
    .bk-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-top: 20px; }
    .bk-gallery-empty { color: var(--bk-color-text-muted); text-align: center; padding: 48px 0; font-size: var(--bk-font-size-sm, 12px); }
    .bk-gallery-item { position: relative; border-radius: var(--bk-border-radius-md, 8px); overflow: hidden; aspect-ratio: 1; background: var(--bk-bg-surface); border: 1px solid var(--bk-border-color-default, #e5e7eb); }
    .bk-gallery-item__img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bk-gallery-item__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; opacity: 0; transition: opacity 0.2s ease; padding: 12px; }
    .bk-gallery-item:hover .bk-gallery-item__overlay { opacity: 1; }
    .bk-gallery-item__desc { font-size: 11px; color: rgba(255,255,255,0.9); text-align: center; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }

    /* Gallery delete button */
    .bk-gallery-item__delete { background: rgba(0,0,0,0.3); border: none; border-radius: 6px; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .bk-gallery-item__delete:hover { background: rgba(220, 38, 38, 0.7); }
  `],
})
export class CompanyPageComponent implements OnInit {
  protected store = inject(CompanyStore);
  protected roomStore = inject(BranchRoomStore);
  private companyApi = inject(CompanyApiService);
  private storageApi = inject(StorageApiService);
  private serviceApi = inject(ServiceApiService);
  private branchService = inject(CompanyBranchService);
  private roomApi = inject(BranchRoomApiService);
  private alertService = inject(AlertService);
  private userStore = inject(UserStore);

  readonly activeTab = signal('datos');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showCompanyModal = signal(false);
  readonly showBranchModal = signal(false);
  readonly showRoomModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly selectedItem = signal<Record<string, any> | null>(null);
  readonly branches = signal<CompanyBranch[]>([]);
  readonly branchesForRoomForm = signal<{ Id: number; VcName: string }[]>([]);
  readonly allBranches = signal<{ Id: number; VcName: string; CompanyId?: number }[]>([]);

  readonly companyOptions = computed(() =>
    this.store.items().map((c: any) => ({ id: String(c.Id ?? c.id), name: c.VcName ?? c.name }))
  );

  readonly selectedCompanyId = new FormControl('');
  readonly selectedCompanyIdForRooms = new FormControl('');
  readonly selectedBranchIdForRooms = new FormControl('');
  readonly selectedCompanyIdForGallery = new FormControl('');

  // Gallery state
  readonly galleryImages = signal<CompanyGalleryImage[]>([]);
  readonly galleryLoading = signal(false);
  readonly savingGallery = signal(false);
  readonly showGalleryDeleteConfirm = signal(false);
  readonly selectedGalleryImage = signal<CompanyGalleryImage | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly galleryTab = signal<'venue' | 'service'>('venue');

  @ViewChild('galleryUploader') galleryUploader?: BkFileUploadComponent;

  readonly companyServices = signal<ServiceEntity[]>([]);
  readonly serviceSelectOptions = computed<BkSelectOption[]>(() =>
    this.companyServices().map(s => ({ value: String(s.Id), label: s.VcName }))
  );

  readonly venueImages = computed(() => this.galleryImages().filter(i => i.VcCategory === 'venue'));
  readonly serviceImages = computed(() => this.galleryImages().filter(i => i.VcCategory === 'service'));

  readonly galleryForm = new FormGroup({
    VcDescription: new FormControl(''),
    ServiceId: new FormControl(''),
  });

  readonly selectedCompanySlug = computed(() => {
    const id = this.selectedCompanyIdForGallery.value;
    if (!id) return '';
    const company = this.store.items().find((c: any) => String(c.Id ?? c.id) === id) as any;
    return company?.VcSlug ?? `company-${id}`;
  });

  readonly companySelectOptions = computed<BkSelectOption[]>(() =>
    this.companyOptions().map(c => ({ value: c.id, label: c.name }))
  );

  readonly branchSelectOptions = computed<BkSelectOption[]>(() =>
    this.branchesForRoomForm().map((b: any) => ({ value: String(b.Id), label: b.VcName }))
  );

  readonly activeBranchFilter = signal<string>('');

  readonly filteredRooms = computed(() => {
    const branchId = this.activeBranchFilter();
    const rooms = this.roomStore.items();
    if (!branchId) return rooms;
    return rooms.filter((r: any) => String(r.CompanyBranch?.Id) === branchId);
  });

  readonly createButtonLabel = computed(() => {
    switch (this.activeTab()) {
      case 'sedes': return 'Crear Sede';
      case 'consultorios': return 'Crear Consultorio';
      default: return 'Crear Empresa';
    }
  });

  readonly deleteTitle = computed(() =>
    this.activeTab() === 'consultorios' ? '¿Eliminar consultorio?' : '¿Eliminar sede?'
  );

  readonly deleteMessage = computed(() =>
    this.activeTab() === 'consultorios'
      ? 'Esta acción no se puede deshacer. Se eliminará el consultorio.'
      : 'Esta acción no se puede deshacer. Se eliminará la sede y sus consultorios asociados.'
  );

  readonly tabs: BkTabItem[] = [
    { id: 'datos', label: 'Datos de Empresa' },
    { id: 'sedes', label: 'Sedes' },
    { id: 'consultorios', label: 'Consultorios' },
    { id: 'galeria', label: 'Galería' },
  ];

  readonly companyColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'VcPrincipalEmail', label: 'Email', sortable: true },
    { key: 'VcPhone', label: 'Teléfono' },
  ];

  readonly branchColumns: DataTableColumn[] = [
    { key: 'VcName', label: 'Nombre', sortable: true },
    { key: 'VcAddress', label: 'Dirección', sortable: true },
    { key: 'VcPhone', label: 'Teléfono' },
    { key: 'VcBranchManagerName', label: 'Encargado' },
  ];

  readonly roomColumns: DataTableColumn[] = [
    { key: 'BranchName', label: 'Sede', sortable: true },
    { key: 'VcNumber', label: 'Número', sortable: true },
    { key: 'VcFloor', label: 'Piso', sortable: true },
    { key: 'VcTower', label: 'Torre' },
    { key: 'BIsMain', label: 'Principal' },
  ];

  ngOnInit(): void {
    this.loadCompanies();

    // Cambiar empresa en tab Sedes → recargar sedes automáticamente
    this.selectedCompanyId.valueChanges.subscribe(() => this.loadBranchesByCompany());

    // Cambiar empresa en tab Consultorios → recargar sedes y consultorios
    this.selectedCompanyIdForRooms.valueChanges.subscribe(() => {
      this.selectedBranchIdForRooms.setValue('', { emitEvent: false });
      this.activeBranchFilter.set('');
      this.loadRoomsByCompany();
    });

    // Cambiar sede en tab Consultorios → filtrar tabla
    this.selectedBranchIdForRooms.valueChanges.subscribe(v => this.activeBranchFilter.set(v ?? ''));

    // Cambiar empresa en tab Galería → recargar imágenes
    this.selectedCompanyIdForGallery.valueChanges.subscribe(() => this.loadGallery());
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
    const opts = this.companyOptions();
    if (opts.length > 0) {
      const firstId = opts[0].id;
      if (tabId === 'sedes') {
        if (!this.selectedCompanyId.value) {
          this.selectedCompanyId.setValue(firstId); // triggers valueChanges → auto-load
        } else {
          this.loadBranchesByCompany(); // force reload with fresh data
        }
      }
      if (tabId === 'consultorios') {
        if (!this.selectedCompanyIdForRooms.value) {
          this.selectedCompanyIdForRooms.setValue(firstId); // triggers valueChanges → auto-load
        } else {
          this.loadRoomsByCompany(); // force reload with fresh data
        }
      }
      if (tabId === 'galeria') {
        if (!this.selectedCompanyIdForGallery.value) {
          this.selectedCompanyIdForGallery.setValue(firstId); // triggers valueChanges → auto-load
        } else {
          this.loadGallery(); // force reload with fresh data
        }
      }
    }
  }

  openCreate(): void {
    this.selectedItem.set(null);
    switch (this.activeTab()) {
      case 'sedes': this.showBranchModal.set(true); break;
      case 'consultorios': this.showRoomModal.set(true); break;
      default: this.showCompanyModal.set(true); break;
    }
  }

  onEdit(row: Record<string, any>): void {
    this.selectedItem.set(row);
    switch (this.activeTab()) {
      case 'sedes': this.showBranchModal.set(true); break;
      case 'consultorios': this.showRoomModal.set(true); break;
      default: this.showCompanyModal.set(true); break;
    }
  }

  onDelete(row: Record<string, any>): void {
    this.selectedItem.set(row);
    this.showDeleteConfirm.set(true);
  }

  closeModals(): void {
    this.showCompanyModal.set(false);
    this.showBranchModal.set(false);
    this.showRoomModal.set(false);
    this.selectedItem.set(null);
  }

  // ── Company CRUD ──

  saveCompany(formData: CompanyFormValue): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const payload = this.store.prepareCreatePayload(formData, selected ?? undefined);

    const obs = selected
      ? this.companyApi.update(selected['Id'], payload as any)
      : this.companyApi.create(payload as any);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente');
        this.closeModals();
        this.loadCompanies();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar empresa');
        this.saving.set(false);
      },
    });
  }

  // ── Branch CRUD ──

  saveBranch(output: BranchFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const companyId = Number(output.companyId);

    if (!companyId) {
      this.alertService.showError('Seleccione una empresa');
      this.saving.set(false);
      return;
    }

    const payload = this.store.prepareBranchPayload(output.formValue, companyId, selected ?? undefined);

    const obs = selected
      ? this.branchService.update(selected['Id'], payload)
      : this.branchService.create(payload);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Sede actualizada correctamente' : 'Sede creada correctamente');
        this.closeModals();
        this.loadBranchesByCompany();
        this.loadAllBranches();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar sede');
        this.saving.set(false);
      },
    });
  }

  // ── BranchRoom CRUD ──

  saveRoom(output: BranchRoomFormOutput): void {
    this.saving.set(true);
    const selected = this.selectedItem();
    const payload = this.roomStore.preparePayload(output.formValue);

    const obs = selected
      ? this.roomApi.update(selected['Id'], payload as any)
      : this.roomApi.create(payload as any);

    obs.subscribe({
      next: () => {
        this.alertService.showSuccess(selected ? 'Consultorio actualizado correctamente' : 'Consultorio creado correctamente');
        this.closeModals();
        this.loadRoomsByCompany();
        this.saving.set(false);
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al guardar consultorio');
        this.saving.set(false);
      },
    });
  }

  // ── Delete ──

  confirmDelete(): void {
    const selected = this.selectedItem();
    if (!selected) return;

    if (this.activeTab() === 'consultorios') {
      this.roomApi.delete(selected['Id']).subscribe({
        next: () => {
          this.alertService.showSuccess('Consultorio eliminado correctamente');
          this.showDeleteConfirm.set(false);
          this.selectedItem.set(null);
          this.loadRoomsByCompany();
        },
        error: (err) => {
          this.alertService.showError(err.message || 'Error al eliminar consultorio');
          this.showDeleteConfirm.set(false);
        },
      });
    } else {
      this.branchService.delete(selected['Id']).subscribe({
        next: () => {
          this.alertService.showSuccess('Sede eliminada correctamente');
          this.showDeleteConfirm.set(false);
          this.selectedItem.set(null);
          this.loadBranchesByCompany();
        },
        error: (err) => {
          this.alertService.showError(err.message || 'Error al eliminar sede');
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
          this.store.setItems(companies);
          this.loading.set(false);
          this.loadAllBranches();
        },
        error: () => {
          this.companyApi.getAll().subscribe({
            next: (res) => { this.store.setItems(res.data ?? []); this.loading.set(false); },
            error: () => this.loading.set(false),
          });
        },
      });
    } else {
      this.companyApi.getAll().subscribe({
        next: (res) => { this.store.setItems(res.data ?? []); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  private loadAllBranches(): void {
    const opts = this.companyOptions();
    if (opts.length === 0) return;
    const requests = opts.map(c =>
      this.branchService.getByCompany(Number(c.id)).pipe(
        map((res: any) => {
          const data = res.data;
          const list: any[] = Array.isArray(data) ? data : (data?.branches ?? []);
          return list.map((b: any) => ({ ...b, CompanyId: Number(c.id) }));
        })
      )
    );
    forkJoin(requests).subscribe({
      next: (results) => this.allBranches.set(results.flat()),
      error: () => {},
    });
  }

  loadBranchesByCompany(): void {
    const companyId = Number(this.selectedCompanyId.value);
    if (!companyId) return;
    this.loading.set(true);
    this.branchService.getByCompany(companyId).subscribe({
      next: (res: any) => {
        const data = res.data;
        const branchList = Array.isArray(data) ? data : (data?.branches ?? []);
        this.branches.set(branchList);
        this.loading.set(false);
      },
      error: () => { this.branches.set([]); this.loading.set(false); },
    });
  }

  // ── Gallery ──

  galleryCategoryLabel(category: GalleryCategory): string {
    const labels: Record<GalleryCategory, string> = {
      venue: 'Establecimiento',
      service: 'Servicios',
      portfolio: 'Portfolio',
    };
    return labels[category] ?? category;
  }

  loadGallery(): void {
    const companyId = Number(this.selectedCompanyIdForGallery.value);
    if (!companyId) return;
    this.galleryLoading.set(true);
    this.companyApi.getGallery(companyId).subscribe({
      next: (res) => {
        this.galleryImages.set(res.data ?? []);
        this.galleryLoading.set(false);
      },
      error: () => {
        this.galleryImages.set([]);
        this.galleryLoading.set(false);
      },
    });
    this.loadCompanyServices(companyId);
  }

  private loadCompanyServices(companyId: number): void {
    this.serviceApi.getByCompany(companyId).subscribe({
      next: (res) => this.companyServices.set(res.data ?? []),
      error: () => this.companyServices.set([]),
    });
  }

  onGalleryFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  onGalleryFileError(msg: string): void {
    this.selectedFile.set(null);
    this.alertService.showError(msg);
  }

  onGalleryFileRemoved(): void {
    this.selectedFile.set(null);
  }

  addGalleryImage(): void {
    const file = this.selectedFile();
    if (!file) {
      this.alertService.showError('Selecciona una imagen primero');
      return;
    }
    const companyId = Number(this.selectedCompanyIdForGallery.value);
    if (!companyId) return;

    const category = this.galleryTab();
    const values = this.galleryForm.value;

    if (category === 'service' && !values.ServiceId) {
      this.alertService.showError('Selecciona un servicio para asociar la imagen');
      return;
    }

    this.savingGallery.set(true);
    const folder = `${this.selectedCompanySlug()}/gallery`;

    const selectedService = category === 'service'
      ? this.companyServices().find(s => String(s.Id) === values.ServiceId)
      : null;

    this.storageApi.upload(file, folder).pipe(
      switchMap(res => this.companyApi.createGalleryImage({
        CompanyId: companyId,
        VcCategory: category,
        VcImageUrl: res.data.key,
        VcDescription: values.VcDescription || undefined,
        ...(selectedService ? {
          ServiceId: selectedService.Id,
          VcCategoryName: selectedService.VcName,
        } : {}),
      })),
    ).subscribe({
      next: () => {
        this.alertService.showSuccess('Imagen subida y agregada a la galería');
        this.galleryForm.reset();
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.galleryUploader?.reset();
        this.loadGallery();
        this.savingGallery.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const msg = this.getUploadErrorMessage(err);
        this.alertService.showError(msg);
        this.savingGallery.set(false);
      },
    });
  }

  private getUploadErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 413) {
      return 'La imagen es demasiado grande. El tamaño máximo permitido es 5 MB.';
    }
    if (err.status === 400) {
      return err.error?.message || 'Formato de archivo no permitido. Usa JPG, PNG, WEBP o GIF.';
    }
    return err.error?.message || 'Error al subir la imagen. Intenta de nuevo.';
  }

  confirmDeleteGalleryImage(image: CompanyGalleryImage): void {
    this.selectedGalleryImage.set(image);
    this.showGalleryDeleteConfirm.set(true);
  }

  confirmDeleteGallery(): void {
    const image = this.selectedGalleryImage();
    if (!image) return;

    this.companyApi.deleteGalleryImage(image.Id).subscribe({
      next: () => {
        this.alertService.showSuccess('Imagen eliminada de la galería');
        this.showGalleryDeleteConfirm.set(false);
        this.selectedGalleryImage.set(null);
        this.loadGallery();
      },
      error: (err) => {
        this.alertService.showError(err.message || 'Error al eliminar imagen');
        this.showGalleryDeleteConfirm.set(false);
      },
    });
  }

  loadRoomsByCompany(): void {
    const companyId = Number(this.selectedCompanyIdForRooms.value);
    if (!companyId) return;
    this.loading.set(true);
    this.branchService.getByCompany(companyId).subscribe({
      next: (res: any) => {
        const data = res.data;
        const branchList: any[] = Array.isArray(data) ? data : (data?.branches ?? []);
        this.branchesForRoomForm.set(branchList);

        if (branchList.length === 0) {
          this.roomStore.setItems([]);
          this.loading.set(false);
          return;
        }

        const roomRequests = branchList.map((b: any) =>
          this.roomApi.getByBranch(b.Id).pipe(
            map(r => (r.data ?? []).map((room: any) => ({ ...room, BranchName: b.VcName })))
          )
        );

        forkJoin(roomRequests).subscribe({
          next: (results) => {
            const allRooms = results.flat();
            this.roomStore.setItems(allRooms);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
