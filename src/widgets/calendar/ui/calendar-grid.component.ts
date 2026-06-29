import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { BkIconComponent } from '@shared/ui';
import type { CalendarEvent, CalendarViewMode } from '../model/calendar.model';
import { getStateColors } from '../model/calendar.model';

const HOUR_START  = 6;
const HOUR_END    = 22;
const HOUR_PX     = 60;          // px per hour
const TOTAL_HOURS = HOUR_END - HOUR_START; // 16

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface DayColumn {
  date: Date;
  label: string;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'bk-calendar-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkIconComponent],
  template: `
    <div class="cal-grid-wrap">

      <!-- Sticky header row -->
      <div class="cal-grid-header" [style.--day-count]="dayCount()">
        <div class="cal-grid-header__corner"></div>
        @for (day of dayColumns(); track day.date.toISOString()) {
          <div
            class="cal-grid-header__day"
            [class.cal-grid-header__day--today]="day.isToday"
          >{{ day.label }}</div>
        }
      </div>

      <!-- Scrollable body -->
      <div class="cal-grid-body">

        <!-- Left: time labels -->
        <div class="cal-grid-times">
          @for (hour of hours; track hour) {
            <div class="cal-grid-times__label" [style.height.px]="HOUR_PX">
              {{ formatHour(hour) }}
            </div>
          }
        </div>

        <!-- Right: day columns -->
        <div class="cal-grid-days" [style.--day-count]="dayCount()">
          @for (day of dayColumns(); track day.date.toISOString()) {
            <div class="cal-grid-day" [class.cal-grid-day--today]="day.isToday">

              <!-- Hour + half-hour lines -->
              @for (hour of hours; track hour) {
                <div class="cal-grid-day__hour" [style.height.px]="HOUR_PX">
                  <div class="cal-grid-day__half-line"></div>
                </div>
              }

              <!-- Current time red line (only on today's column) -->
              @if (day.isToday && nowTop() >= 0) {
                <div class="cal-grid-now-line" [style.top.px]="nowTop()"></div>
              }

              <!-- Appointment cards -->
              @for (event of day.events; track event.id) {
                <div
                  class="calendar-card"
                  [style.top.px]="getEventTop(event)"
                  [style.height.px]="getEventHeight(event)"
                  [style.background-color]="getStateColor(event.stateId).bg"
                  [style.border-left]="'3px solid ' + getStateColor(event.stateId).border"
                  (click)="onEventClick(event, $event)"
                >
                  <div class="calendar-card__time">{{ event.startTime }} – {{ event.endTime }}</div>
                  <div class="calendar-card__title">{{ event.title }}</div>
                  <div class="calendar-card__client">{{ event.clientName }}</div>
                  @if (getEventHeight(event) > 52) {
                    <div class="calendar-card__professional">{{ event.professionalName }}</div>
                  }
                  @if (getEventHeight(event) > 68) {
                    <div class="calendar-card__state" [style.color]="getStateColor(event.stateId).text">
                      {{ event.stateName }}
                    </div>
                  }
                  <button
                    class="calendar-card__state-btn"
                    type="button"
                    (click)="onStateChangeClick(event, $event)"
                    aria-label="Cambiar estado"
                  >
                    <bk-icon name="ellipsis-vertical" size="sm" />
                  </button>
                </div>
              }

              <!-- Click slots (invisible, behind events) -->
              @for (hour of hours; track hour) {
                <div
                  class="cal-grid-day__slot"
                  [style.top.px]="hour * HOUR_PX - HOUR_START * HOUR_PX"
                  [style.height.px]="HOUR_PX"
                  (click)="onSlotClick(day.date, hour)"
                ></div>
              }

            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Outer wrapper ────────────────────────────── */

    .cal-grid-wrap {
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bk-bg-surface, #fff);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 260px);
    }

    /* ── Sticky header ────────────────────────────── */

    .cal-grid-header {
      display: grid;
      grid-template-columns: 56px repeat(var(--day-count, 7), 1fr);
      flex-shrink: 0;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
      background: var(--bk-bg-surface, #fff);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .cal-grid-header__corner {
      border-right: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .cal-grid-header__day {
      text-align: center;
      padding: 10px 4px 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bk-color-text-muted);
      border-right: 1px solid var(--bk-border-color-default, #e5e7eb);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .cal-grid-header__day--today {
      color: var(--bk-color-primary, #3b82f6);
    }

    /* ── Scrollable body ──────────────────────────── */

    .cal-grid-body {
      display: flex;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    /* ── Time labels column ───────────────────────── */

    .cal-grid-times {
      width: 56px;
      flex-shrink: 0;
      border-right: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .cal-grid-times__label {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding-right: 8px;
      padding-top: 4px;
      font-size: 11px;
      color: var(--bk-color-text-muted);
      box-sizing: border-box;
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .cal-grid-times__label:first-child {
      border-top: none;
    }

    /* ── Day columns container ────────────────────── */

    .cal-grid-days {
      display: grid;
      grid-template-columns: repeat(var(--day-count, 7), 1fr);
      flex: 1;
      min-width: 0;
    }

    /* ── Individual day column ────────────────────── */

    .cal-grid-day {
      position: relative;
      border-right: 1px solid var(--bk-border-color-default, #e5e7eb);
      min-height: 0;
    }

    .cal-grid-day:last-child {
      border-right: none;
    }

    .cal-grid-day--today {
      background: color-mix(in srgb, var(--bk-color-primary, #3b82f6) 4%, transparent);
    }

    /* ── Hour dividers inside each day ───────────── */

    .cal-grid-day__hour {
      position: relative;
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
      box-sizing: border-box;
    }

    .cal-grid-day__hour:first-child {
      border-top: none;
    }

    .cal-grid-day__half-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      border-top: 1px dashed var(--bk-border-color-default, #e5e7eb);
      opacity: 0.6;
      pointer-events: none;
    }

    /* ── Click slots (invisible overlay) ─────────── */

    .cal-grid-day__slot {
      position: absolute;
      left: 0;
      right: 0;
      cursor: pointer;
      z-index: 0;
    }

    .cal-grid-day__slot:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #3b82f6) 6%, transparent);
    }

    /* ── Current time line ────────────────────────── */

    .cal-grid-now-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: #EF4444;
      z-index: 8;
      pointer-events: none;
    }

    .cal-grid-now-line::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #EF4444;
    }

    /* ── Appointment cards ────────────────────────── */

    .calendar-card {
      position: absolute;
      left: 2px;
      right: 2px;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 11px;
      overflow: hidden;
      cursor: pointer;
      z-index: 2;
      transition: box-shadow 0.15s;
      box-sizing: border-box;
      min-height: 22px;
    }

    .calendar-card:hover {
      box-shadow: var(--bk-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.15));
      z-index: 4;
    }

    .calendar-card__time {
      font-weight: 600;
      font-size: 10px;
      opacity: 0.8;
    }

    .calendar-card__title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .calendar-card__client,
    .calendar-card__professional {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 10px;
      opacity: 0.8;
    }

    .calendar-card__state {
      font-weight: 500;
      font-size: 10px;
    }

    .calendar-card__state-btn {
      position: absolute;
      top: 2px;
      right: 2px;
      background: color-mix(in srgb, var(--bk-bg-surface, #fff) 75%, transparent);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s;
      color: var(--bk-color-text-primary);
    }

    .calendar-card:hover .calendar-card__state-btn {
      opacity: 1;
    }
  `],
})
export class CalendarGridComponent implements OnInit, OnDestroy { // force-rebuild
  private cdr = inject(ChangeDetectorRef);

  readonly events      = input<CalendarEvent[]>([]);
  readonly viewMode    = input<CalendarViewMode>('week');
  readonly currentDate = input.required<Date>();

  readonly eventClicked       = output<CalendarEvent>();
  readonly slotClicked        = output<{ date: Date; time: string }>();
  readonly stateChangeClicked = output<{ event: CalendarEvent; domEvent: MouseEvent }>();

  readonly HOUR_PX    = HOUR_PX;
  readonly HOUR_START = HOUR_START;
  readonly hours      = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

  readonly dayCount = computed(() => this.viewMode() === 'day' ? 1 : 7);

  readonly dayColumns = computed<DayColumn[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mode = this.viewMode();
    const d    = this.currentDate();

    let dates: Date[];
    if (mode === 'day') {
      dates = [new Date(d)];
    } else {
      const weekStart = this.getWeekStart(d);
      dates = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        return day;
      });
    }

    return dates.map(date => {
      const dayKey   = this.dateKey(date);
      const dateCopy = new Date(date);
      dateCopy.setHours(0, 0, 0, 0);

      return {
        date,
        label:   this.formatDayLabel(date),
        isToday: dateCopy.getTime() === today.getTime(),
        events:  this.events().filter(e => this.dateKey(e.date) === dayKey),
      };
    });
  });

  private readonly isDark = signal(document.documentElement.classList.contains('dark'));
  private darkObserver?: MutationObserver;

  private currentNow  = signal(new Date());
  private nowInterval?: ReturnType<typeof setInterval>;

  readonly nowTop = computed(() => {
    const now = this.currentNow();
    const h   = now.getHours();
    const m   = now.getMinutes();
    if (h < HOUR_START || h >= HOUR_END) return -10;
    return (h - HOUR_START) * HOUR_PX + m;
  });

  ngOnInit(): void {
    this.nowInterval = setInterval(() => {
      this.currentNow.set(new Date());
      this.cdr.markForCheck();
    }, 60_000);

    this.darkObserver = new MutationObserver(() => {
      this.isDark.set(document.documentElement.classList.contains('dark'));
      this.cdr.markForCheck();
    });
    this.darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy(): void {
    if (this.nowInterval) clearInterval(this.nowInterval);
    this.darkObserver?.disconnect();
  }

  formatHour(hour: number): string {
    return `${hour}:00`;
  }

  formatDayLabel(date: Date): string {
    const name  = DAY_NAMES_SHORT[date.getDay()];
    const day   = date.getDate();
    const month = date.getMonth() + 1;
    return `${name} ${day}/${month}`;
  }

  getEventTop(event: CalendarEvent): number {
    const [h, m] = event.startTime.split(':').map(Number);
    return (h - HOUR_START) * HOUR_PX + m;
  }

  getEventHeight(event: CalendarEvent): number {
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    const durationMin = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(durationMin, 22);
  }

  getStateColor(stateId: number): { bg: string; border: string; text: string } {
    return getStateColors(stateId, this.isDark());
  }

  onEventClick(event: CalendarEvent, domEvent: MouseEvent): void {
    domEvent.stopPropagation();
    this.eventClicked.emit(event);
  }

  onSlotClick(date: Date, hour: number): void {
    this.slotClicked.emit({ date, time: `${String(hour).padStart(2, '0')}:00` });
  }

  onStateChangeClick(event: CalendarEvent, domEvent: MouseEvent): void {
    domEvent.stopPropagation();
    this.stateChangeClicked.emit({ event, domEvent });
  }

  private getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day  = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private dateKey(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
}
