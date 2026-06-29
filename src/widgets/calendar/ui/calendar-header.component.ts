import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { BkIconComponent } from '@shared/ui';
import type { CalendarViewMode } from '../model/calendar.model';
import { STATE_COLORS } from '../model/calendar.model';

const STATE_LABELS: { id: number; name: string; color: string }[] = [
  { id: 1, name: 'Programada',      color: STATE_COLORS[1].border },
  { id: 2, name: 'Confirmada',      color: STATE_COLORS[2].border },
  { id: 5, name: 'Completada',      color: STATE_COLORS[5].border },
  { id: 3, name: 'Cancelada',       color: STATE_COLORS[3].border },
  { id: 6, name: 'No se presentó',  color: STATE_COLORS[6].border },
];

const MONTH_NAMES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const DAY_NAMES_LONG = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

@Component({
  selector: 'bk-calendar-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkIconComponent],
  template: `
    <div class="cal-header">
      <div class="cal-header__nav">
        <span class="cal-header__range">{{ dateRangeLabel() }}</span>
        <button class="cal-header__arrow" (click)="navigatePrev()" aria-label="Anterior">
          <bk-icon name="chevron-left" size="sm" />
        </button>
        <button class="cal-header__today" (click)="goToday()">Hoy</button>
        <button class="cal-header__arrow" (click)="navigateNext()" aria-label="Siguiente">
          <bk-icon name="chevron-right" size="sm" />
        </button>
      </div>

      <div class="cal-header__states">
        @for (state of states; track state.id) {
          <span class="cal-header__state-item">
            <span class="cal-header__state-dot" [style.background]="state.color"></span>
            <span class="cal-header__state-label">{{ state.name }}</span>
          </span>
        }
      </div>

      <div class="cal-header__view-toggle">
        <button
          class="cal-header__toggle-btn"
          [class.cal-header__toggle-btn--active]="viewMode() === 'week'"
          (click)="setViewMode('week')"
        >Semana</button>
        <button
          class="cal-header__toggle-btn"
          [class.cal-header__toggle-btn--active]="viewMode() === 'day'"
          (click)="setViewMode('day')"
        >Día</button>
      </div>
    </div>
  `,
  styles: [`
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
      margin-bottom: 0;
      flex-wrap: wrap;
    }

    .cal-header__nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cal-header__range {
      font-size: 15px;
      font-weight: 600;
      color: var(--bk-color-text-primary);
      min-width: 160px;
    }

    .cal-header__arrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 6px;
      cursor: pointer;
      color: var(--bk-color-text-primary);
      transition: background 0.15s;
    }

    .cal-header__arrow:hover {
      background: var(--bk-border-color-default, #e5e7eb);
    }

    .cal-header__today {
      height: 32px;
      padding: 0 14px;
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--bk-color-text-primary);
      cursor: pointer;
      transition: background 0.15s;
    }

    .cal-header__today:hover {
      background: var(--bk-border-color-default, #e5e7eb);
    }

    .cal-header__states {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cal-header__state-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .cal-header__state-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cal-header__state-label {
      font-size: 12px;
      color: var(--bk-color-text-muted);
    }

    .cal-header__view-toggle {
      display: flex;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
    }

    .cal-header__toggle-btn {
      height: 32px;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 500;
      background: var(--bk-bg-surface, #fff);
      border: none;
      color: var(--bk-color-text-muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .cal-header__toggle-btn + .cal-header__toggle-btn {
      border-left: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .cal-header__toggle-btn--active {
      background: var(--bk-color-primary, #3b82f6);
      color: #fff;
    }

    .cal-header__toggle-btn:not(.cal-header__toggle-btn--active):hover {
      background: var(--bk-border-color-default, #e5e7eb);
    }
  `],
})
export class CalendarHeaderComponent { // force-rebuild
  readonly currentDate = input.required<Date>();
  readonly viewMode    = input.required<CalendarViewMode>();

  readonly dateChange     = output<Date>();
  readonly viewModeChange = output<CalendarViewMode>();

  readonly states = STATE_LABELS;

  readonly dateRangeLabel = computed(() => {
    const d = this.currentDate();
    const mode = this.viewMode();

    if (mode === 'day') {
      const dayName = DAY_NAMES_LONG[d.getDay()];
      const day = d.getDate();
      const month = MONTH_NAMES[d.getMonth()];
      return `${this.capitalize(dayName)}, ${day} de ${month}`;
    }

    // week view: Mon–Sun of the week
    const weekStart = this.getWeekStart(d);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startStr = `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`;
    const endStr   = `${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]}`;
    return `${startStr} – ${endStr}`;
  });

  navigatePrev(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    this.dateChange.emit(d);
  }

  navigateNext(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    this.dateChange.emit(d);
  }

  goToday(): void {
    this.dateChange.emit(new Date());
  }

  setViewMode(mode: CalendarViewMode): void {
    this.viewModeChange.emit(mode);
  }

  private getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay(); // 0=Dom, 1=Lun, ...
    const diff = (day === 0) ? -6 : 1 - day; // adjust to Monday
    date.setDate(date.getDate() + diff);
    return date;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
