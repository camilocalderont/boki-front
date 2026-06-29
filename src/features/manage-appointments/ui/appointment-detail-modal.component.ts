import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CurrencyPipe, SlicePipe } from '@angular/common';
import {
  BkModalComponent,
  BkButtonComponent,
  BkIconComponent,
  BkSpinnerComponent,
} from '@shared/ui';
import { AppointmentApiService } from '@entities/appointment';
import type { Appointment } from '@entities/appointment';
import { AlertService } from '@shared/lib';
import { getStateColors } from '@widgets/calendar';
import { QuickStateChangeComponent } from './quick-state-change.component';

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'bk-appointment-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    SlicePipe,
    BkModalComponent,
    BkButtonComponent,
    BkIconComponent,
    BkSpinnerComponent,
    QuickStateChangeComponent,
  ],
  template: `
    <bk-modal
      [open]="open()"
      title="Detalle de la cita"
      size="md"
      [closeable]="true"
      (closed)="onClose()"
    >
      @if (loading()) {
        <div class="adm__loading">
          <bk-spinner />
          <span>Cargando información de la cita…</span>
        </div>
      } @else if (detail()) {
        <div class="adm">

          <!-- ── Estado + acción ──────────────────────────────────────── -->
          <div class="adm__state-row">
            <span
              class="adm__state-badge"
              [style.background]="stateColor().bg"
              [style.color]="stateColor().text"
              [style.border]="'1px solid ' + stateColor().border"
            >
              {{ detail()!.CurrentState?.VcName ?? 'Sin estado' }}
            </span>

            <button
              type="button"
              class="adm__state-btn"
              [disabled]="isTerminalState()"
              (click)="toggleStatePopover($event)"
            >
              <bk-icon name="refresh" size="sm" />
              Cambiar estado
            </button>
          </div>

          <!-- ── Info rápida (fecha, hora, duración) ──────────────────── -->
          <div class="adm__info-cards">
            <div class="adm__info-card">
              <bk-icon name="calendar-days" size="sm" class="adm__info-icon" />
              <div>
                <div class="adm__info-label">Fecha</div>
                <div class="adm__info-value">{{ formattedDate() }}</div>
              </div>
            </div>
            <div class="adm__info-card">
              <bk-icon name="clock" size="sm" class="adm__info-icon" />
              <div>
                <div class="adm__info-label">Horario</div>
                <div class="adm__info-value">{{ detail()!.TStartTime | slice:0:5 }} – {{ detail()!.TEndTime | slice:0:5 }}</div>
              </div>
            </div>
            @if (detail()!.Service) {
              <div class="adm__info-card">
                <bk-icon name="clock" size="sm" class="adm__info-icon" />
                <div>
                  <div class="adm__info-label">Duración</div>
                  <div class="adm__info-value">{{ detail()!.Service!.VcTime }}</div>
                </div>
              </div>
            }
          </div>

          <!-- ── Participantes ────────────────────────────────────────── -->
          <section class="adm__section">
            <h3 class="adm__section-title">Participantes</h3>

            <div class="adm__participants">
              <!-- Cliente -->
              @if (detail()!.Client) {
                <div class="adm__participant-card">
                  <div class="adm__participant-header">
                    <bk-icon name="user" size="sm" class="adm__participant-icon" />
                    <span class="adm__participant-role">Cliente</span>
                  </div>
                  <div class="adm__participant-name">
                    {{ detail()!.Client!.VcFirstName }} {{ detail()!.Client!.VcFirstLastName }}
                  </div>
                  @if (detail()!.Client!.VcPhone) {
                    <div class="adm__participant-contact">
                      <bk-icon name="phone" size="sm" />
                      <span>{{ detail()!.Client!.VcPhone }}</span>
                    </div>
                  }
                  @if (detail()!.Client!.VcIdentificationNumber) {
                    <div class="adm__participant-contact">
                      <bk-icon name="clipboard" size="sm" />
                      <span>{{ detail()!.Client!.VcIdentificationNumber }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Profesional -->
              @if (detail()!.Professional) {
                <div class="adm__participant-card">
                  <div class="adm__participant-header">
                    <bk-icon name="briefcase" size="sm" class="adm__participant-icon" />
                    <span class="adm__participant-role">Profesional</span>
                  </div>
                  <div class="adm__participant-name">
                    {{ detail()!.Professional!.VcFirstName }} {{ detail()!.Professional!.VcFirstLastName }}
                  </div>
                  @if (detail()!.Professional!.VcSpecialization) {
                    <div class="adm__participant-contact">
                      <bk-icon name="tag" size="sm" />
                      <span>{{ detail()!.Professional!.VcSpecialization }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </section>

          <!-- ── Servicio ─────────────────────────────────────────────── -->
          @if (detail()!.Service) {
            <section class="adm__section">
              <h3 class="adm__section-title">Servicio</h3>
              <div class="adm__service-card">
                <div class="adm__service-name">{{ detail()!.Service!.VcName }}</div>
                <div class="adm__service-meta">
                  @if (detail()!.Service!.VcTime) {
                    <div class="adm__service-detail">
                      <bk-icon name="clock" size="sm" />
                      <span>{{ detail()!.Service!.VcTime }}</span>
                    </div>
                  }
                  @if (detail()!.Service!.IRegularPrice != null) {
                    <div class="adm__service-detail">
                      <bk-icon name="credit-card" size="sm" />
                      <span>{{ detail()!.Service!.IRegularPrice | currency:'COP':'symbol':'1.0-0':'es-CO' }}</span>
                    </div>
                  }
                </div>
                @if (detail()!.Service!.ServiceStages?.length) {
                  <div class="adm__stages">
                    <div class="adm__stages-title">Etapas</div>
                    @for (stage of detail()!.Service!.ServiceStages; track stage.Id ?? $index) {
                      <div class="adm__stage-item">
                        <span class="adm__stage-dot"></span>
                        <span class="adm__stage-desc">{{ stage.VcDescription || 'Etapa ' + stage.ISequence }}</span>
                        <span class="adm__stage-dur">{{ stage.IDurationMinutes }} min</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- ── Metadatos ────────────────────────────────────────────── -->
          <section class="adm__section adm__section--meta">
            <div class="adm__meta-row">
              <span class="adm__meta-label">Creada</span>
              <span class="adm__meta-value">{{ formattedCreatedAt() }}</span>
            </div>
            @if (detail()!.DtUpdatedAt) {
              <div class="adm__meta-row">
                <span class="adm__meta-label">Actualizada</span>
                <span class="adm__meta-value">{{ formattedUpdatedAt() }}</span>
              </div>
            }
          </section>

          <!-- ── Footer ────────────────────────────────────────────────── -->
          <div class="adm__footer">
            <bk-button variant="ghost" size="md" (clicked)="onClose()">
              Cerrar
            </bk-button>
            <bk-button variant="primary" size="md" (clicked)="requestEdit()">
              <bk-icon name="edit" size="sm" />
              Editar cita
            </bk-button>
          </div>
        </div>
      }
    </bk-modal>

    <!-- Popover de cambio rápido — fuera del modal para evitar z-index issues -->
    @if (detail() && showStatePopover()) {
      <bk-quick-state-change
        [appointment]="toCalendarEvent()"
        [visible]="showStatePopover()"
        [position]="popoverPosition()"
        (stateChanged)="onStateChangedFromPopover($event)"
        (closed)="showStatePopover.set(false)"
      />
    }
  `,
  styles: [`
    .adm__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 0;
      color: var(--bk-color-text-muted, #9ca3af);
      font-size: 14px;
    }

    .adm {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* ── Estado ──────────────────────────────────────────────────────────── */

    .adm__state-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
    }

    .adm__state-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
    }

    .adm__state-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 8px;
      background: transparent;
      color: var(--bk-color-text-secondary, #6b7280);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.1s ease, color 0.1s ease;
    }

    .adm__state-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--bk-border-color-default, #e5e7eb) 30%, transparent);
      color: var(--bk-color-text-primary, #111827);
    }

    .adm__state-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ── Info cards ──────────────────────────────────────────────────────── */

    .adm__info-cards {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .adm__info-card {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      flex: 1;
      min-width: 120px;
      padding: 10px 12px;
      background: color-mix(in srgb, var(--bk-border-color-default, #e5e7eb) 20%, transparent);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 8px;
    }

    .adm__info-icon {
      color: var(--bk-color-text-muted, #9ca3af);
      margin-top: 2px;
      flex-shrink: 0;
    }

    .adm__info-label {
      font-size: 11px;
      color: var(--bk-color-text-muted, #9ca3af);
      line-height: 1;
    }

    .adm__info-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--bk-color-text-primary, #111827);
      margin-top: 2px;
    }

    /* ── Sections ────────────────────────────────────────────────────────── */

    .adm__section {
      margin-bottom: 20px;
    }

    .adm__section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--bk-color-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 10px;
    }

    /* ── Participantes ───────────────────────────────────────────────────── */

    .adm__participants {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    @media (max-width: 480px) {
      .adm__participants {
        grid-template-columns: 1fr;
      }
    }

    .adm__participant-card {
      padding: 12px;
      background: color-mix(in srgb, var(--bk-border-color-default, #e5e7eb) 20%, transparent);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 10px;
    }

    .adm__participant-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }

    .adm__participant-icon {
      color: var(--bk-color-text-muted, #9ca3af);
    }

    .adm__participant-role {
      font-size: 11px;
      font-weight: 500;
      color: var(--bk-color-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .adm__participant-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .adm__participant-contact {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--bk-color-text-secondary, #6b7280);
      margin-top: 4px;
    }

    /* ── Servicio ────────────────────────────────────────────────────────── */

    .adm__service-card {
      padding: 12px 14px;
      background: color-mix(in srgb, var(--bk-border-color-default, #e5e7eb) 20%, transparent);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 10px;
    }

    .adm__service-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
      margin-bottom: 8px;
    }

    .adm__service-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .adm__service-detail {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--bk-color-text-secondary, #6b7280);
    }

    /* ── Stages ──────────────────────────────────────────────────────────── */

    .adm__stages {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed var(--bk-border-color-default, #e5e7eb);
    }

    .adm__stages-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--bk-color-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }

    .adm__stage-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 0;
      font-size: 12px;
      color: var(--bk-color-text-secondary, #6b7280);
    }

    .adm__stage-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--bk-color-primary, #3b82f6);
      flex-shrink: 0;
    }

    .adm__stage-desc { flex: 1; }

    .adm__stage-dur {
      font-weight: 500;
      color: var(--bk-color-text-muted, #9ca3af);
    }

    /* ── Metadatos ───────────────────────────────────────────────────────── */

    .adm__section--meta {
      padding-top: 12px;
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .adm__meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 3px 0;
    }

    .adm__meta-label {
      color: var(--bk-color-text-muted, #9ca3af);
    }

    .adm__meta-value {
      color: var(--bk-color-text-secondary, #6b7280);
    }

    /* ── Footer ──────────────────────────────────────────────────────────── */

    .adm__footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
      margin-top: 4px;
    }
  `],
})
export class AppointmentDetailModalComponent {
  private readonly api          = inject(AppointmentApiService);
  private readonly alertService = inject(AlertService);

  // ── Inputs ─────────────────────────────────────────────────────────────────
  appointmentId = input<number | null>(null);
  open          = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────────
  closed        = output<void>();
  stateChanged  = output<void>();
  editRequested = output<Appointment>();

  // ── Internal state ─────────────────────────────────────────────────────────
  readonly detail           = signal<Appointment | null>(null);
  readonly loading          = signal(false);
  readonly showStatePopover = signal(false);
  readonly popoverPosition  = signal({ top: 0, left: 0 });

  constructor() {
    // Load full detail when modal opens with a valid ID
    effect(() => {
      const id   = this.appointmentId();
      const open = this.open();

      if (open && id !== null) {
        this.loadDetail(id);
      } else if (!open) {
        // Reset when modal closes
        this.detail.set(null);
        this.showStatePopover.set(false);
      }
    });
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly stateColor = computed(() => {
    const id = this.detail()?.CurrentStateId ?? 0;
    const isDark = document.documentElement.classList.contains('dark');
    return getStateColors(id, isDark);
  });

  readonly formattedDate = computed(() => {
    const d = this.detail();
    if (!d?.DtDate) return '';
    const dateStr = d.DtDate.split(' ')[0].split('T')[0];
    const [y, m, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, day);
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  readonly formattedCreatedAt = computed(() => {
    const d = this.detail();
    if (!d?.DtCreatedAt) return '';
    return new Date(d.DtCreatedAt).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });

  readonly formattedUpdatedAt = computed(() => {
    const d = this.detail();
    if (!d?.DtUpdatedAt) return '';
    return new Date(d.DtUpdatedAt).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });

  readonly isTerminalState = computed(() => {
    const id = this.detail()?.CurrentStateId;
    return id === 5 || id === 6;
  });

  /** Build a CalendarEvent stub from the current detail to feed the popover */
  readonly toCalendarEvent = computed(() => {
    const d = this.detail()!;
    const clientName = d.Client
      ? `${d.Client.VcFirstName} ${d.Client.VcFirstLastName}`.trim()
      : `Cliente #${d.ClientId}`;
    return {
      id:               d.Id,
      title:            d.Service?.VcName ?? `Servicio #${d.ServiceId}`,
      startTime:        this.normalizeTime(d.TStartTime),
      endTime:          this.normalizeTime(d.TEndTime),
      date:             new Date(d.DtDate),
      stateId:          d.CurrentStateId,
      stateName:        d.CurrentState?.VcName ?? '',
      clientName,
      professionalName: d.Professional
        ? `${d.Professional.VcFirstName} ${d.Professional.VcFirstLastName}`.trim()
        : `Profesional #${d.ProfessionalId}`,
      data: d,
    };
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  onClose(): void {
    this.showStatePopover.set(false);
    this.closed.emit();
  }

  requestEdit(): void {
    if (this.detail()) {
      this.editRequested.emit(this.detail()!);
    }
    this.onClose();
  }

  toggleStatePopover(event: MouseEvent): void {
    if (this.showStatePopover()) {
      this.showStatePopover.set(false);
      return;
    }

    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    this.popoverPosition.set({
      top:  rect.bottom + 8,
      left: Math.max(8, rect.left - 50),
    });
    this.showStatePopover.set(true);
  }

  onStateChangedFromPopover(payload: { appointmentId: number; newStateId: number }): void {
    this.showStatePopover.set(false);
    // Reload detail to reflect new state
    this.loadDetail(payload.appointmentId);
    this.stateChanged.emit();
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private loadDetail(id: number): void {
    this.loading.set(true);
    this.api.getById(id).subscribe({
      next: (res) => {
        this.detail.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.alertService.showError('No se pudo cargar el detalle de la cita');
        this.onClose();
      },
    });
  }

  private normalizeTime(time: string): string {
    if (!time) return '00:00';
    const parts = time.split(':');
    return `${parts[0].padStart(2, '0')}:${(parts[1] ?? '00').padStart(2, '0')}`;
  }
}
