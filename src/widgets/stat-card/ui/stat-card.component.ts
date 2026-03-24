import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type StatCardColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'bk-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-stat-card">
      <div class="bk-stat-card__icon-wrapper" [style]="iconStyles()">
        <span class="bk-stat-card__icon" [innerHTML]="iconSvg()"></span>
      </div>
      <div class="bk-stat-card__content">
        <span class="bk-stat-card__label">{{ label() }}</span>
        <span class="bk-stat-card__value">{{ value() }}</span>
        @if (comparison()) {
          <span class="bk-stat-card__comparison">{{ comparison() }}</span>
        }
      </div>
    </div>
  `,
  styles: `
    .bk-stat-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #E2E8F0);
      border-radius: var(--bk-border-radius-lg, 12px);
      box-shadow: var(--bk-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }

    .bk-stat-card__icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--bk-border-radius-md, 8px);
      flex-shrink: 0;
    }

    .bk-stat-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
    }

    .bk-stat-card__icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .bk-stat-card__content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .bk-stat-card__label {
      font-size: var(--bk-font-size-sm, 12px);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748B);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      line-height: 1.3;
    }

    .bk-stat-card__value {
      font-size: 24px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #0F172A);
      line-height: 1.2;
    }

    .bk-stat-card__comparison {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted, #94A3B8);
      margin-top: 2px;
    }
  `,
})
export class BkStatCardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<string>('bar-chart');
  readonly color = input<StatCardColor>('primary');
  readonly comparison = input<string>('');

  private readonly colorMap: Record<StatCardColor, string> = {
    primary: 'var(--bk-color-primary, #2563EB)',
    success: 'var(--bk-color-success, #10B981)',
    warning: 'var(--bk-color-warning, #F59E0B)',
    danger: 'var(--bk-color-danger, #EF4444)',
    info: 'var(--bk-color-info, #3B82F6)',
  };

  private readonly iconMap: Record<string, string> = {
    building: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    layers: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'bar-chart': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    'message-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    'help-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  readonly iconStyles = computed(() => {
    const c = this.colorMap[this.color()];
    return `background: color-mix(in srgb, ${c} 12%, transparent); color: ${c};`;
  });

  readonly iconSvg = computed((): SafeHtml => {
    const raw = this.iconMap[this.icon()] ?? this.iconMap['bar-chart'];
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });
}
