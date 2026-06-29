import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { BkSpinnerComponent, BkButtonComponent, BkIconComponent, BkModalComponent, BkSelectComponent, BkSearchInputComponent, BkViewToggleComponent } from '@shared/ui';
import type { BkSelectOption, BkViewToggleOption } from '@shared/ui';
import { FormsModule } from '@angular/forms';
import { CalendarHeaderComponent, CalendarGridComponent, getStateColors } from '@widgets/calendar';
import type { CalendarEvent, CalendarViewMode } from '@widgets/calendar';
import { AlertService } from '@shared/lib';
import { AppointmentApiService } from '@entities/appointment';
import type { Appointment } from '@entities/appointment';
import { CompanyApiService } from '@entities/company';
import { ProfessionalApiService } from '@entities/professional';
import { UserStore } from '@entities/user';
import {
  NewAppointmentFormComponent,
  QuickStateChangeComponent,
  AppointmentDetailModalComponent,
} from '@features/manage-appointments';
import { BkDataTableComponent } from '@widgets/data-table';
import type { DataTableColumn } from '@widgets/data-table';
import { map } from 'rxjs';

const STATE_NAMES: Record<number, string> = {
  1: 'Programada',
  2: 'Confirmada',
  3: 'Cancelada',
  4: 'Reagendada',
  5: 'Completada',
  6: 'No se presentó',
};

const STATE_OPTIONS: BkSelectOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: '1', label: 'Programada' },
  { value: '2', label: 'Confirmada' },
  { value: '3', label: 'Cancelada' },
  { value: '4', label: 'Reagendada' },
  { value: '5', label: 'Completada' },
  { value: '6', label: 'No se presentó' },
];

type ViewTab = 'calendar' | 'table';

@Component({
  standalone: true,
  selector: 'bk-appointments-page',
  imports: [
    FormsModule,
    BkSpinnerComponent,
    BkButtonComponent,
    BkIconComponent,
    BkModalComponent,
    BkSelectComponent,
    BkSearchInputComponent,
    BkViewToggleComponent,
    CalendarHeaderComponent,
    CalendarGridComponent,
    NewAppointmentFormComponent,
    QuickStateChangeComponent,
    AppointmentDetailModalComponent,
    BkDataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-page">
      <div class="bk-page__header">
        <div>
          <h1 class="bk-page__title">Citas</h1>
          <p class="bk-page__subtitle">Gestión de citas y reservas</p>
        </div>
        <div class="bk-page__actions">
          <bk-view-toggle
            [options]="viewTabOptions"
            [value]="viewTab()"
            (valueChange)="onViewTabChange($event)"
          />

          @if (companyOptions().length > 1) {
            <div class="bk-page__company-select">
              <bk-select
                placeholder="Empresa"
                [options]="companyOptions()"
                [ngModel]="selectedCompanyId()"
                (ngModelChange)="onCompanyChange($event)"
              />
            </div>
          }
          <bk-button variant="primary" size="md" (clicked)="openCreate()">
            <bk-icon name="plus" size="sm" />
            Nueva Cita
          </bk-button>
        </div>
      </div>

      @if (viewTab() === 'calendar') {
        <div class="bk-page__calendar-controls">
          <bk-calendar-header
            [currentDate]="currentDate()"
            [viewMode]="viewMode()"
            (dateChange)="onDateChange($event)"
            (viewModeChange)="onViewModeChange($event)"
          />
          @if (professionalOptions().length > 2) {
            <div class="bk-page__professional-filter">
              <bk-select
                placeholder="Filtrar por profesional"
                [options]="professionalOptions()"
                [ngModel]="calendarProfessionalFilter()"
                (ngModelChange)="onProfessionalFilterChange($event)"
              />
            </div>
          }
        </div>

        @if (loading()) {
          <div class="bk-page__loader"><bk-spinner /></div>
        } @else {
          <bk-calendar-grid
            [events]="calendarEvents()"
            [viewMode]="viewMode()"
            [currentDate]="currentDate()"
            (eventClicked)="onEventClick($event)"
            (slotClicked)="onSlotClick($event)"
            (stateChangeClicked)="onStateChangeClick($event)"
          />
        }
      } @else {
        @if (loading()) {
          <div class="bk-page__loader"><bk-spinner /></div>
        } @else {
          <!-- Filtros proyectados fuera de la tarjeta -->
          <bk-data-table
            [data]="filteredTableData()"
            [columns]="tableColumns"
            [showToolbar]="false"
            [showActions]="true"
            trackByKey="Id"
            emptyMessage="No hay citas registradas"
          >
            <!-- Slot de filtros (se proyecta SOBRE la tabla) -->
            <div class="bk-page__table-filters" tableFilters>
              <div class="bk-page__filter-item bk-page__filter-item--professional">
                <bk-select
                  placeholder="Todos los profesionales"
                  [options]="professionalOptions()"
                  [showAllOption]="false"
                  [ngModel]="tableProfessionalFilter()"
                  (ngModelChange)="onTableProfessionalChange($event)"
                />
              </div>
              <div class="bk-page__filter-item bk-page__filter-item--client">
                <bk-search-input
                  placeholder="Buscar cliente..."
                  (searchChange)="onTableClientSearch($event)"
                />
              </div>
              <div class="bk-page__filter-item bk-page__filter-item--state">
                <bk-select
                  placeholder="Todos los estados"
                  [options]="stateOptions"
                  [showAllOption]="false"
                  [ngModel]="tableStateFilter()"
                  (ngModelChange)="onTableStateChange($event)"
                />
              </div>
            </div>

            <!-- Template de acciones por fila -->
            <ng-template #rowActions let-row>
              <div class="bk-page__row-actions">
                <button
                  type="button"
                  class="bk-page__action-btn"
                  (click)="onViewDetailFromTable(row.Id)"
                  title="Ver detalle"
                >
                  <bk-icon name="eye" size="sm" />
                </button>
                <button
                  type="button"
                  class="bk-page__action-btn"
                  (click)="onChangeStateFromTable({ appointmentId: row.Id, event: $event })"
                  title="Cambiar estado"
                >
                  <bk-icon name="refresh" size="sm" />
                </button>
              </div>
            </ng-template>
          </bk-data-table>
        }
      }
    </div>

    <!-- Templates de celdas personalizadas (ocultos, usados via cellTemplate) -->
    <ng-template #dateCell let-row="row">
      <span class="bk-page__cell-date">{{ formatTableDate(row.DtDate) }}</span>
      <span class="bk-page__cell-time">{{ normalizeTimePublic(row.TStartTime) }}</span>
    </ng-template>

    <ng-template #clientCell let-row="row">
      @if (row.Client) {
        <span class="bk-page__cell-name">{{ row.Client.VcFirstName }} {{ row.Client.VcFirstLastName }}</span>
        <span class="bk-page__cell-sub">{{ row.Client.VcPhone }}</span>
      } @else {
        <span class="bk-page__cell-muted">Cliente #{{ row.ClientId }}</span>
      }
    </ng-template>

    <ng-template #professionalCell let-row="row">
      @if (row.Professional) {
        <span>{{ row.Professional.VcFirstName }} {{ row.Professional.VcFirstLastName }}</span>
      } @else {
        <span class="bk-page__cell-muted">Profesional #{{ row.ProfessionalId }}</span>
      }
    </ng-template>

    <ng-template #durationCell let-row="row">
      {{ formatDuration(row.Service?.VcTime) }}
    </ng-template>

    <ng-template #priceCell let-row="row">
      {{ formatPrice(row.Service?.IRegularPrice) }}
    </ng-template>

    <ng-template #stateCell let-row="row">
      <span
        class="bk-page__state-badge"
        [style.background]="getStateBg(row.CurrentStateId)"
        [style.color]="getStateTextColor(row.CurrentStateId)"
        [style.border-color]="getStateBorderColor(row.CurrentStateId)"
      >
        {{ row.CurrentState?.VcName ?? getStateName(row.CurrentStateId) }}
      </span>
    </ng-template>

    <bk-modal
      [open]="showCreateModal()"
      title="Nueva Cita"
      size="lg"
      [closeable]="true"
      (closed)="showCreateModal.set(false)"
    >
      @if (showCreateModal() && companyId() !== null) {
        <bk-new-appointment-form
          [companyId]="companyId()!"
          [preselectedDate]="preselectedDate()"
          [preselectedTime]="preselectedTime()"
          (saved)="onSaved()"
          (cancelled)="showCreateModal.set(false)"
        />
      }
    </bk-modal>

    <!-- Modal detalle de cita -->
    <bk-appointment-detail-modal
      [appointmentId]="selectedAppointmentId()"
      [open]="showDetailModal()"
      (closed)="showDetailModal.set(false)"
      (stateChanged)="onDetailStateChanged()"
      (editRequested)="onEditRequested($event)"
    />

    <!-- Popover cambio rápido de estado -->
    @if (quickStateEvent()) {
      <bk-quick-state-change
        [appointment]="quickStateEvent()!"
        [visible]="showQuickState()"
        [position]="quickStatePosition()"
        (stateChanged)="onStateChanged($event)"
        (closed)="showQuickState.set(false)"
      />
    }
  `,
  styles: [`
    .bk-page { padding: 24px 0; }
    .bk-page__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
    }
    .bk-page__title {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin: 0;
      line-height: 1.3;
    }
    .bk-page__subtitle {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted);
      margin-top: 4px;
    }
    .bk-page__actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bk-page__company-select {
      min-width: 200px;
    }
    .bk-page__calendar-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bk-page__calendar-controls bk-calendar-header {
      flex: 1;
    }
    .bk-page__professional-filter {
      min-width: 220px;
      flex-shrink: 0;
    }
    .bk-page__loader {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    /* ── Filtros de tabla ──────────────────────────────────────────────── */
    .bk-page__table-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .bk-page__filter-item { flex-shrink: 0; }
    .bk-page__filter-item--professional { min-width: 220px; }
    .bk-page__filter-item--client { min-width: 200px; }
    .bk-page__filter-item--state { min-width: 200px; }

    /* ── Acciones de fila ──────────────────────────────────────────────── */
    .bk-page__row-actions {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .bk-page__action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--bk-border-radius-sm, 6px);
      background: transparent;
      color: var(--bk-color-text-muted, #64748B);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .bk-page__action-btn:hover {
      background: color-mix(in srgb, var(--bk-border-color-default, #E2E8F0) 40%, transparent);
      color: var(--bk-color-text-primary, #0F172A);
    }

    /* ── Celdas personalizadas ─────────────────────────────────────────── */
    .bk-page__cell-date {
      display: block;
      font-weight: 500;
      color: var(--bk-color-text-primary, #0F172A);
      white-space: nowrap;
    }
    .bk-page__cell-time {
      display: block;
      font-size: var(--bk-font-size-xs, 11px);
      color: var(--bk-color-text-muted, #94A3B8);
      margin-top: 2px;
    }
    .bk-page__cell-name {
      display: block;
      font-weight: 500;
    }
    .bk-page__cell-sub {
      display: block;
      font-size: var(--bk-font-size-xs, 11px);
      color: var(--bk-color-text-muted, #94A3B8);
      margin-top: 2px;
    }
    .bk-page__cell-muted {
      color: var(--bk-color-text-muted, #94A3B8);
      font-style: italic;
    }

    /* ── Badge de estado ───────────────────────────────────────────────── */
    .bk-page__state-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: var(--bk-border-radius-full, 9999px);
      border: 1px solid;
      font-size: var(--bk-font-size-xs, 11px);
      font-weight: 600;
      white-space: nowrap;
    }
  `],
})
export class AppointmentsPageComponent implements OnInit, AfterViewInit {
  private readonly api              = inject(AppointmentApiService);
  private readonly companyApi       = inject(CompanyApiService);
  private readonly professionalApi  = inject(ProfessionalApiService);
  private readonly userStore        = inject(UserStore);
  private readonly alertService     = inject(AlertService);

  // ── ViewChild: templates de celdas ────────────────────────────────────────

  @ViewChild('dateCell') dateCellTpl!: TemplateRef<any>;
  @ViewChild('clientCell') clientCellTpl!: TemplateRef<any>;
  @ViewChild('professionalCell') professionalCellTpl!: TemplateRef<any>;
  @ViewChild('durationCell') durationCellTpl!: TemplateRef<any>;
  @ViewChild('priceCell') priceCellTpl!: TemplateRef<any>;
  @ViewChild('stateCell') stateCellTpl!: TemplateRef<any>;

  // ── Config ─────────────────────────────────────────────────────────────────

  readonly viewTabOptions: BkViewToggleOption[] = [
    { value: 'calendar', label: 'Calendario', icon: 'calendar-days' },
    { value: 'table',    label: 'Tabla',      icon: 'table-cells' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────

  readonly viewTab     = signal<ViewTab>('calendar');
  readonly currentDate = signal<Date>(new Date());
  readonly viewMode    = signal<CalendarViewMode>('week');
  readonly loading     = signal(false);

  // Modal de nueva cita
  readonly showCreateModal  = signal(false);
  readonly preselectedDate  = signal<string | null>(null);
  readonly preselectedTime  = signal<string | null>(null);

  // Modal detalle de cita
  readonly showDetailModal       = signal(false);
  readonly selectedAppointmentId = signal<number | null>(null);

  // Popover cambio rápido de estado
  readonly showQuickState    = signal(false);
  readonly quickStateEvent   = signal<CalendarEvent | null>(null);
  readonly quickStatePosition = signal({ top: 0, left: 0 });

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly companyId   = signal<number | null>(null);
  readonly selectedCompanyId     = signal<string>('');
  private readonly companies     = signal<any[]>([]);
  readonly companyOptions        = computed<BkSelectOption[]>(() =>
    this.companies().map(c => ({
      value: String(c.Id ?? c.id),
      label: c.VcName ?? c.VcTradeName ?? c.vc_name ?? 'Empresa',
    }))
  );

  // Filtro por profesional en calendario
  readonly calendarProfessionalFilter = signal<string>('');
  private readonly professionals      = signal<any[]>([]);
  readonly professionalOptions        = computed<BkSelectOption[]>(() => [
    { value: '', label: 'Todos los profesionales' },
    ...this.professionals().map(p => ({
      value: String(p.Id ?? p.id),
      label: `${p.VcFirstName} ${p.VcFirstLastName}`.trim(),
    })),
  ]);

  // ── Filtros de la vista Tabla ──────────────────────────────────────────────

  readonly tableProfessionalFilter = signal<string>('');
  readonly tableClientSearch       = signal<string>('');
  readonly tableStateFilter        = signal<string>('');
  readonly stateOptions: BkSelectOption[] = STATE_OPTIONS;

  // ── Columns de la tabla (se inicializan en AfterViewInit) ─────────────────

  tableColumns: DataTableColumn[] = [];

  // ── Derived ────────────────────────────────────────────────────────────────

  readonly calendarEvents = computed<CalendarEvent[]>(() => {
    const filter = this.calendarProfessionalFilter();
    const all = this.appointments().map(a => this.toCalendarEvent(a));
    if (!filter) return all;
    return all.filter(e => String(e.data?.ProfessionalId) === filter);
  });

  readonly filteredTableData = computed<Appointment[]>(() => {
    const raw        = this.appointments();
    const profFilter  = this.tableProfessionalFilter().trim();
    const clientFilter = this.tableClientSearch().toLowerCase().trim();
    const stateFilter = this.tableStateFilter().trim();

    let result = raw;

    if (profFilter) {
      result = result.filter(a => String(a.ProfessionalId) === profFilter);
    }

    if (clientFilter) {
      result = result.filter(a => {
        if (!a.Client) return false;
        const name  = `${a.Client.VcFirstName} ${a.Client.VcFirstLastName}`.toLowerCase();
        const phone = (a.Client.VcPhone ?? '').toLowerCase();
        return name.includes(clientFilter) || phone.includes(clientFilter);
      });
    }

    if (stateFilter) {
      result = result.filter(a => String(a.CurrentStateId) === stateFilter);
    }

    // Ordenar por fecha + hora descendente
    return [...result].sort((a, b) => {
      const dtA = new Date(`${a.DtDate.split(' ')[0]}T${a.TStartTime}`).getTime();
      const dtB = new Date(`${b.DtDate.split(' ')[0]}T${b.TStartTime}`).getTime();
      return dtB - dtA;
    });
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  constructor() {
    effect(() => {
      const id = this.companyId();
      const date = this.currentDate();
      const tab = this.viewTab();
      if (id !== null) {
        this.loadAppointments(id, tab === 'table' ? null : date);
      }
    });
  }

  ngOnInit(): void {
    this.resolveCompanyAndLoad();
  }

  ngAfterViewInit(): void {
    this.tableColumns = [
      { key: 'DtDate',                  label: 'Fecha / Hora',  sortable: true, cellTemplate: this.dateCellTpl },
      { key: 'Client',                  label: 'Cliente',                       cellTemplate: this.clientCellTpl },
      { key: 'Professional',            label: 'Profesional',                   cellTemplate: this.professionalCellTpl },
      { key: 'Service.VcName',          label: 'Servicio' },
      { key: 'Service.VcTime',          label: 'Duración',                      cellTemplate: this.durationCellTpl },
      { key: 'Service.IRegularPrice',   label: 'Precio',                        cellTemplate: this.priceCellTpl },
      { key: 'CurrentState.VcName',     label: 'Estado',                        cellTemplate: this.stateCellTpl },
    ];
  }

  // ── Handlers generales ─────────────────────────────────────────────────────

  onDateChange(date: Date): void {
    this.currentDate.set(date);
  }

  onViewModeChange(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  onViewTabChange(value: string): void {
    this.viewTab.set(value as ViewTab);
  }

  onCompanyChange(value: string): void {
    this.selectedCompanyId.set(value);
    this.companyId.set(Number(value));
    this.loadProfessionals(Number(value));
    this.calendarProfessionalFilter.set('');
  }

  onProfessionalFilterChange(value: string): void {
    this.calendarProfessionalFilter.set(value);
  }

  openCreate(): void {
    this.preselectedDate.set(null);
    this.preselectedTime.set(null);
    this.showCreateModal.set(true);
  }

  onSaved(): void {
    this.showCreateModal.set(false);
    const id = this.companyId();
    if (id !== null) {
      this.loadAppointments(id, this.currentDate());
    }
  }

  onEventClick(event: CalendarEvent): void {
    this.selectedAppointmentId.set(event.id);
    this.showDetailModal.set(true);
  }

  onSlotClick(slot: { date: Date; time: string }): void {
    this.preselectedDate.set(this.formatDate(slot.date));
    this.preselectedTime.set(slot.time);
    this.showCreateModal.set(true);
  }

  onStateChangeClick(payload: { event: CalendarEvent; domEvent: MouseEvent }): void {
    this.quickStateEvent.set(payload.event);

    const target = payload.domEvent.currentTarget as HTMLElement;
    const rect   = target.getBoundingClientRect();
    this.quickStatePosition.set({
      top:  rect.bottom + 8,
      left: Math.max(8, rect.left - 80),
    });

    this.showQuickState.set(true);
  }

  onStateChanged(payload: { appointmentId: number; newStateId: number }): void {
    this.showQuickState.set(false);
    const id = this.companyId();
    if (id !== null) {
      this.loadAppointments(id, this.currentDate());
    }
  }

  onDetailStateChanged(): void {
    const id = this.companyId();
    if (id !== null) {
      this.loadAppointments(id, this.currentDate());
    }
  }

  onEditRequested(appointment: Appointment): void {
    // TODO: abrir modal de edición cuando esté implementado
    console.log('[AppointmentsPage] Editar cita:', appointment);
  }

  // ── Handlers de la vista Tabla ─────────────────────────────────────────────

  onViewDetailFromTable(appointmentId: number): void {
    this.selectedAppointmentId.set(appointmentId);
    this.showDetailModal.set(true);
  }

  onChangeStateFromTable(payload: { appointmentId: number; event: MouseEvent }): void {
    const apt = this.appointments().find(a => a.Id === payload.appointmentId);
    if (!apt) return;

    this.quickStateEvent.set(this.toCalendarEvent(apt));

    const target = payload.event.currentTarget as HTMLElement;
    const rect   = target.getBoundingClientRect();
    this.quickStatePosition.set({
      top:  rect.bottom + 8,
      left: Math.max(8, rect.left - 80),
    });

    this.showQuickState.set(true);
  }

  onTableProfessionalChange(value: string): void {
    this.tableProfessionalFilter.set(value ?? '');
  }

  onTableClientSearch(value: string): void {
    this.tableClientSearch.set(value);
  }

  onTableStateChange(value: string): void {
    this.tableStateFilter.set(value ?? '');
  }

  // ── Helpers de formato ─────────────────────────────────────────────────────

  formatTableDate(dtDate: string): string {
    if (!dtDate) return '—';
    const dateStr = dtDate.split(' ')[0].split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  normalizeTimePublic(time: string): string {
    if (!time) return '—';
    const parts = time.split(':');
    return `${parts[0].padStart(2, '0')}:${(parts[1] ?? '00').padStart(2, '0')}`;
  }

  formatDuration(vcTime: string | undefined): string {
    if (!vcTime) return '—';
    const [h, m] = vcTime.split(':').map(Number);
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    if (m > 0) return `${m}min`;
    return vcTime;
  }

  formatPrice(price: number | undefined): string {
    if (price == null) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getStateName(stateId: number): string {
    return STATE_NAMES[stateId] ?? `Estado ${stateId}`;
  }

  getStateBg(stateId: number): string {
    return getStateColors(stateId, document.documentElement.classList.contains('dark')).bg;
  }

  getStateTextColor(stateId: number): string {
    return getStateColors(stateId, document.documentElement.classList.contains('dark')).text;
  }

  getStateBorderColor(stateId: number): string {
    return getStateColors(stateId, document.documentElement.classList.contains('dark')).border;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private resolveCompanyAndLoad(): void {
    this.loading.set(true);
    const userId = this.userStore.currentUser()?.id;

    if (userId) {
      this.companyApi.getPermissionsByUser(userId).pipe(
        map(res => (res.data ?? []).map((p: any) => p.Company).filter(Boolean))
      ).subscribe({
        next: (companies: any[]) => {
          this.companies.set(companies);
          if (companies.length > 0) {
            const id = companies[0].Id ?? companies[0].id;
            this.selectedCompanyId.set(String(id));
            this.companyId.set(Number(id));
            this.loadProfessionals(Number(id));
          } else {
            this.loading.set(false);
          }
        },
        error: () => {
          this.companyApi.getAll().subscribe({
            next: (res) => {
              const list = res.data ?? [];
              if (list.length > 0) {
                const first: any = list[0];
                this.companyId.set(Number(first.Id ?? first.id));
              } else {
                this.loading.set(false);
              }
            },
            error: () => this.loading.set(false),
          });
        },
      });
    } else {
      this.companyApi.getAll().subscribe({
        next: (res) => {
          const list = res.data ?? [];
          if (list.length > 0) {
            const first: any = list[0];
            this.companyId.set(Number(first.Id ?? first.id));
          } else {
            this.loading.set(false);
          }
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private loadProfessionals(companyId: number): void {
    this.professionalApi.getByCompany(companyId).subscribe({
      next: (res) => this.professionals.set(res.data ?? []),
      error: () => this.professionals.set([]),
    });
  }

  private loadAppointments(companyId: number, date: Date | null): void {
    this.loading.set(true);

    const startDate = date ? this.getDateRange(date).startDate : undefined;
    const endDate = date ? this.getDateRange(date).endDate : undefined;

    this.api.getByCompany(companyId, startDate, endDate).subscribe({
      next: (res) => {
        this.appointments.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.alertService.showError('No se pudieron cargar las citas');
      },
    });
  }

  private getDateRange(date: Date): { startDate: string; endDate: string } {
    if (this.viewMode() === 'day') {
      const d = this.formatDate(date);
      return { startDate: d, endDate: d };
    }

    // Week view: Monday to Sunday
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      startDate: this.formatDate(weekStart),
      endDate:   this.formatDate(weekEnd),
    };
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private toCalendarEvent(a: Appointment): CalendarEvent {
    const clientName = a.Client
      ? `${a.Client.VcFirstName} ${a.Client.VcFirstLastName}`.trim()
      : `Cliente #${a.ClientId}`;

    const professionalName = a.Professional
      ? `${a.Professional.VcFirstName} ${a.Professional.VcFirstLastName}`.trim()
      : `Profesional #${a.ProfessionalId}`;

    const title = a.Service?.VcName ?? `Servicio #${a.ServiceId}`;

    let endTime = a.TEndTime ?? '';
    if (!endTime && a.Service?.VcTime) {
      endTime = this.addDuration(a.TStartTime, a.Service.VcTime);
    }
    if (!endTime) {
      endTime = this.addMinutes(a.TStartTime, 60);
    }

    return {
      id:               a.Id,
      title,
      startTime:        this.normalizeTime(a.TStartTime),
      endTime:          this.normalizeTime(endTime),
      date:             new Date(a.DtDate),
      stateId:          a.CurrentStateId,
      stateName:        a.CurrentState?.VcName ?? '',
      clientName,
      professionalName,
      data:             a,
    };
  }

  private normalizeTime(time: string): string {
    if (!time) return '00:00';
    const parts = time.split(':');
    return `${parts[0].padStart(2, '0')}:${(parts[1] ?? '00').padStart(2, '0')}`;
  }

  private addDuration(startTime: string, duration: string): string {
    const [sh, sm] = startTime.split(':').map(Number);
    const [dh, dm] = duration.split(':').map(Number);
    const totalMin = sh * 60 + sm + dh * 60 + dm;
    return this.minutesToTime(totalMin);
  }

  private addMinutes(startTime: string, minutes: number): string {
    const [h, m] = startTime.split(':').map(Number);
    return this.minutesToTime(h * 60 + m + minutes);
  }

  private minutesToTime(totalMin: number): string {
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
