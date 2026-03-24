import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'bk-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="hostClasses()" [style]="hostStyles()">
      <ng-content />
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .bk-badge {
      display: inline-flex;
      align-items: center;
      font-weight: 500;
      white-space: nowrap;
      border-radius: var(--bk-border-radius-full, 9999px);
      line-height: 1;
    }

    .bk-badge-sm {
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
    }

    .bk-badge-md {
      padding: 0.25rem 0.75rem;
      font-size: 0.8125rem;
    }
  `,
})
export class BkBadgeComponent {
  /** Visual variant controlling the badge color. */
  variant = input<BadgeVariant>('neutral');

  /** Size preset for the badge. */
  size = input<BadgeSize>('sm');

  /** Map from variant to its corresponding CSS variable. */
  private readonly variantColorMap: Record<BadgeVariant, string> = {
    success: 'var(--bk-color-success, #10b981)',
    warning: 'var(--bk-color-warning, #f59e0b)',
    danger: 'var(--bk-color-danger, #ef4444)',
    info: 'var(--bk-color-info, #3b82f6)',
    neutral: 'var(--bk-color-neutral, #6b7280)',
  };

  /** Computed CSS classes combining base, size, and variant. */
  hostClasses = computed(() => `bk-badge bk-badge-${this.size()}`);

  /** Computed inline styles for variant-based coloring using color-mix. */
  hostStyles = computed(() => {
    const color = this.variantColorMap[this.variant()];
    return `background: color-mix(in srgb, ${color} 15%, transparent); color: ${color};`;
  });
}
