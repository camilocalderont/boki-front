import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

@Component({
  selector: 'bk-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="bk-tooltip-wrapper">
      <ng-content />
      <span class="bk-tooltip-text" role="tooltip">{{ text() }}</span>
    </span>
  `,
  styles: `
    .bk-tooltip-wrapper {
      position: relative;
      display: inline-flex;
    }

    .bk-tooltip-text {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      background: var(--bk-color-text-primary, #0F172A);
      color: #fff;
      font-size: var(--bk-font-size-sm, 12px);
      font-family: var(--bk-font-family);
      border-radius: var(--bk-border-radius-sm, 6px);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: var(--bk-z-tooltip, 1100);
    }

    .bk-tooltip-wrapper:hover .bk-tooltip-text {
      opacity: 1;
    }
  `,
})
export class BkTooltipComponent {
  readonly text = input.required<string>();
}
