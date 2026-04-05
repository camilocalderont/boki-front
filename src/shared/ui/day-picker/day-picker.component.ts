import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface DayPickerItem {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday?: boolean;
  isPast: boolean;
}

@Component({
  selector: 'bk-day-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-day-picker">
      @for (day of days(); track day.dateStr) {
        <button
          type="button"
          class="bk-day-picker__item"
          [class.bk-day-picker__item--selected]="selectedDate() === day.dateStr"
          [class.bk-day-picker__item--today]="day.isToday"
          [disabled]="day.isPast"
          (click)="dateSelected.emit(day.dateStr)">
          <span class="bk-day-picker__name">{{ day.dayName }}</span>
          <span class="bk-day-picker__number">{{ day.dayNumber }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    .bk-day-picker {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bk-day-picker__item {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid var(--bk-border-color-default, #E2E8F0);
      background-color: var(--bk-bg-surface, #fff);
      gap: 2px;
      flex-shrink: 0;
      transition: border-color 0.15s, background-color 0.15s, color 0.15s;
    }

    .bk-day-picker__item:hover:not(:disabled) {
      border-color: var(--bk-color-primary, #2563EB);
    }

    .bk-day-picker__item--selected {
      background-color: var(--bk-color-primary, #2563EB) !important;
      border-color: var(--bk-color-primary, #2563EB) !important;
      color: #fff !important;
    }

    .bk-day-picker__item--today:not(.bk-day-picker__item--selected) {
      border-color: var(--bk-color-primary, #2563EB);
    }

    .bk-day-picker__item:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .bk-day-picker__name {
      font-size: var(--bk-font-size-xs, 11px);
      font-weight: 500;
      color: var(--bk-color-text-muted, #94A3B8);
    }

    .bk-day-picker__item--selected .bk-day-picker__name {
      color: rgba(255, 255, 255, 0.85);
    }

    .bk-day-picker__number {
      font-size: var(--bk-font-size-sm, 13px);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1E293B);
    }

    .bk-day-picker__item--selected .bk-day-picker__number {
      color: #fff;
    }

    .bk-day-picker__item:disabled .bk-day-picker__name,
    .bk-day-picker__item:disabled .bk-day-picker__number {
      color: var(--bk-color-text-muted, #94A3B8);
    }
  `,
})
export class BkDayPickerComponent {
  readonly days = input.required<DayPickerItem[]>();
  readonly selectedDate = input<string | null>(null);
  readonly dateSelected = output<string>();
}
