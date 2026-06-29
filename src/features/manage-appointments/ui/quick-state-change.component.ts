import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { BkIconComponent, BkSpinnerComponent } from '@shared/ui';
import { AppointmentApiService } from '@entities/appointment';
import type { AppointmentState } from '@entities/appointment';
import type { CalendarEvent } from '@widgets/calendar';
import { getStateColors } from '@widgets/calendar';
import { AlertService } from '@shared/lib';

// ── Transition map ────────────────────────────────────────────────────────────
// Key = current state ID. Value = set of state IDs reachable from it.
const ALLOWED_TRANSITIONS: Record<number, Set<number>> = {
  1: new Set([2, 3, 4]),       // Programada → Confirmada, Cancelada, Reagendada
  2: new Set([3, 4, 5, 6]),    // Confirmada → Cancelada, Reagendada, Completada, No se presentó
  3: new Set([1]),             // Cancelada → Programada (reabrir)
  4: new Set([2, 3]),          // Reagendada → Confirmada, Cancelada
  5: new Set(),                // Completada — terminal
  6: new Set(),                // No se presentó — terminal
};

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'bk-quick-state-change',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkIconComponent, BkSpinnerComponent],
  template: `
    <!-- Backdrop: cierra al hacer clic fuera -->
    @if (visible()) {
      <div class="qsc-backdrop" (click)="close()"></div>
    }

    <div
      class="qsc"
      [class.qsc--visible]="visible()"
      [style.top.px]="adjustedPosition().top"
      [style.left.px]="adjustedPosition().left"
    >
      <!-- Header -->
      <div class="qsc__header">
        <span class="qsc__title">Cambiar estado</span>
        <button class="qsc__close" type="button" (click)="close()" aria-label="Cerrar">
          <bk-icon name="x-mark" size="sm" />
        </button>
      </div>

      <!-- Info de la cita -->
      <div class="qsc__info">
        <div class="qsc__service">{{ appointment().title }}</div>
        <div class="qsc__client">{{ appointment().clientName }}</div>
        <div class="qsc__time">{{ appointment().startTime }} – {{ appointment().endTime }}</div>
      </div>

      <!-- Estado actual -->
      <div class="qsc__current">
        <span class="qsc__label">Estado actual</span>
        <span
          class="qsc__badge"
          [style.background]="currentColor().bg"
          [style.color]="currentColor().text"
          [style.border]="'1px solid ' + currentColor().border"
        >
          {{ appointment().stateName }}
        </span>
      </div>

      <div class="qsc__divider"></div>

      <!-- Lista de estados disponibles -->
      <div class="qsc__states">
        @if (loadingStates()) {
          <div class="qsc__loading"><bk-spinner /></div>
        } @else {
          @for (state of allStates(); track state.Id) {
            <button
              type="button"
              class="qsc__state-option"
              [class.qsc__state-option--active]="state.Id === appointment().stateId"
              [class.qsc__state-option--disabled]="isStateLocked(state.Id)"
              [disabled]="isStateLocked(state.Id) || submitting()"
              (click)="selectState(state.Id)"
            >
              <span
                class="qsc__state-dot"
                [style.background]="stateColor(state.Id).border"
              ></span>
              <span class="qsc__state-name">{{ state.VcName }}</span>

              @if (submitting() && pendingStateId() === state.Id) {
                <bk-spinner class="qsc__spinner" />
              } @else if (state.Id === appointment().stateId) {
                <bk-icon name="check" size="sm" class="qsc__check" />
              } @else if (isStateLocked(state.Id)) {
                <bk-icon name="lock-closed" size="sm" class="qsc__lock" />
              }
            </button>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .qsc-backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
    }

    .qsc {
      position: fixed;
      z-index: 1000;
      width: 260px;
      background: var(--bk-bg-surface, #ffffff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-lg, 12px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95) translateY(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    .qsc--visible {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1) translateY(0);
    }

    .qsc__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px 10px;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .qsc__title {
      font-size: 13px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
    }

    .qsc__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--bk-color-text-muted, #9ca3af);
      cursor: pointer;
      transition: background 0.1s ease, color 0.1s ease;
    }

    .qsc__close:hover {
      background: var(--bk-color-bg-hover, rgba(0,0,0,0.06));
      color: var(--bk-color-text-primary, #111827);
    }

    .qsc__info {
      padding: 10px 14px;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .qsc__service {
      font-size: 13px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
      line-height: 1.3;
    }

    .qsc__client {
      font-size: 12px;
      color: var(--bk-color-text-secondary, #6b7280);
      margin-top: 2px;
    }

    .qsc__time {
      font-size: 11px;
      color: var(--bk-color-text-muted, #9ca3af);
      margin-top: 2px;
    }

    .qsc__current {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
    }

    .qsc__label {
      font-size: 11px;
      color: var(--bk-color-text-muted, #9ca3af);
      white-space: nowrap;
    }

    .qsc__badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 500;
    }

    .qsc__divider {
      height: 1px;
      background: var(--bk-border-color-default, #e5e7eb);
      margin: 0;
    }

    .qsc__states {
      padding: 6px 0 8px;
    }

    .qsc__state-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 14px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: background 0.1s ease;
    }

    .qsc__state-option:hover:not(:disabled) {
      background: var(--bk-color-bg-hover, rgba(0,0,0,0.04));
    }

    .qsc__state-option--active {
      background: var(--bk-color-bg-hover, rgba(0,0,0,0.04));
    }

    .qsc__state-option--disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .qsc__state-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .qsc__state-name {
      flex: 1;
      font-size: 13px;
      color: var(--bk-color-text-primary, #111827);
    }

    .qsc__check {
      color: var(--bk-color-success, #10b981);
    }

    .qsc__lock {
      color: var(--bk-color-text-muted, #9ca3af);
    }

    .qsc__loading {
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .qsc__spinner {
      width: 14px;
      height: 14px;
    }
  `],
})
export class QuickStateChangeComponent implements OnInit {
  private readonly api          = inject(AppointmentApiService);
  private readonly alertService = inject(AlertService);

  // ── Inputs ─────────────────────────────────────────────────────────────────
  appointment = input.required<CalendarEvent>();
  visible     = input<boolean>(false);
  position    = input<{ top: number; left: number }>({ top: 0, left: 0 });

  // ── Outputs ────────────────────────────────────────────────────────────────
  stateChanged = output<{ appointmentId: number; newStateId: number }>();
  closed       = output<void>();

  // ── Internal state ─────────────────────────────────────────────────────────
  readonly allStates     = signal<AppointmentState[]>([]);
  readonly loadingStates = signal(false);
  readonly submitting    = signal(false);
  readonly pendingStateId = signal<number | null>(null);

  // ── Dark mode helper ───────────────────────────────────────────────────────
  private isDark(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  private readonly POPOVER_WIDTH = 260;
  private readonly POPOVER_HEIGHT = 350;

  readonly adjustedPosition = computed(() => {
    const pos = this.position();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = pos.left;
    let top = pos.top;

    if (left + this.POPOVER_WIDTH > vw - 8) {
      left = vw - this.POPOVER_WIDTH - 8;
    }
    if (left < 8) left = 8;

    if (top + this.POPOVER_HEIGHT > vh - 8) {
      top = pos.top - this.POPOVER_HEIGHT - 16;
    }
    if (top < 8) top = 8;

    return { top, left };
  });

  readonly currentColor = computed(() =>
    getStateColors(this.appointment().stateId, this.isDark())
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadStates();
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  close(): void {
    this.closed.emit();
  }

  isStateLocked(stateId: number): boolean { // rebuild
    const currentId = this.appointment().stateId;
    if (stateId === currentId) return false;
    const allowed = ALLOWED_TRANSITIONS[currentId];
    return !allowed || !allowed.has(stateId);
  }

  stateColor(stateId: number): { bg: string; border: string; text: string } {
    return getStateColors(stateId, this.isDark());
  }

  selectState(stateId: number): void {
    if (stateId === this.appointment().stateId) return;
    if (this.isStateLocked(stateId)) return;
    if (this.submitting()) return;

    this.submitting.set(true);
    this.pendingStateId.set(stateId);

    this.api.changeState(this.appointment().id, { CurrentStateId: stateId }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.pendingStateId.set(null);
        this.stateChanged.emit({ appointmentId: this.appointment().id, newStateId: stateId });
        this.close();
      },
      error: () => {
        this.submitting.set(false);
        this.pendingStateId.set(null);
        this.alertService.showError('No se pudo cambiar el estado de la cita');
      },
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private loadStates(): void {
    this.loadingStates.set(true);
    this.api.getAllStates().subscribe({
      next: (res) => {
        this.allStates.set(res.data ?? []);
        this.loadingStates.set(false);
      },
      error: () => {
        this.loadingStates.set(false);
        this.alertService.showError('No se pudieron cargar los estados');
      },
    });
  }
}
