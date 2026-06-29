import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { BkIconComponent } from '../icon/icon.component';
import type { BkIconName } from '../icon/icon.component';

export interface BkViewToggleOption {
  value: string;
  label: string;
  icon?: BkIconName;
}

@Component({
  selector: 'bk-view-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkIconComponent],
  template: `
    <div class="bk-view-toggle">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="bk-view-toggle__btn"
          [class.bk-view-toggle__btn--active]="option.value === value()"
          (click)="onSelect(option.value)"
        >
          @if (option.icon) {
            <bk-icon [name]="option.icon" size="sm" />
          }
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: inline-flex; }

    .bk-view-toggle {
      display: inline-flex;
      align-items: center;
      background: var(--bk-bg-page, #F1F5F9);
      border: 1px solid var(--bk-border-color-default, #E2E8F0);
      border-radius: var(--bk-border-radius-full, 9999px);
      padding: 3px;
      gap: 2px;
    }

    .bk-view-toggle__btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 14px;
      border: none;
      border-radius: var(--bk-border-radius-full, 9999px);
      background: transparent;
      color: var(--bk-color-text-muted, #64748B);
      font-size: var(--bk-font-size-sm, 13px);
      font-family: var(--bk-font-family);
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }

    .bk-view-toggle__btn:hover:not(.bk-view-toggle__btn--active) {
      color: var(--bk-color-text-primary, #0F172A);
    }

    .bk-view-toggle__btn--active {
      background: var(--bk-color-primary, #2563EB);
      color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
  `,
})
export class BkViewToggleComponent {
  readonly options = input.required<BkViewToggleOption[]>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  onSelect(value: string): void {
    this.valueChange.emit(value);
  }
}
