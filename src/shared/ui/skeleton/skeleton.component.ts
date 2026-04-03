import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bk-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }

    .skeleton {
      position: relative;
      overflow: hidden;
      background: var(--bk-bg-page, #e2e8f0);
      border-radius: var(--bk-border-radius-lg, 12px);
    }

    .skeleton::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--bk-bg-surface, #fff) 40%, transparent) 50%,
        transparent 100%
      );
      animation: shimmer 1.8s infinite ease-in-out;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Variants */
    .skeleton--circle { border-radius: 50%; }
    .skeleton--text { border-radius: var(--bk-border-radius-sm, 6px); }
    .skeleton--rounded { border-radius: var(--bk-border-radius-lg, 12px); }
    .skeleton--square { border-radius: 0; }
  `,
  template: `
    <div
      class="skeleton"
      [class.skeleton--circle]="variant() === 'circle'"
      [class.skeleton--text]="variant() === 'text'"
      [class.skeleton--rounded]="variant() === 'rounded'"
      [class.skeleton--square]="variant() === 'square'"
      [style.width]="width()"
      [style.height]="height()"
      [style.aspect-ratio]="aspectRatio()"
    ></div>
  `,
})
export class BkSkeletonComponent {
  readonly variant = input<'rounded' | 'circle' | 'text' | 'square'>('rounded');
  readonly width = input<string>('100%');
  readonly height = input<string>('');
  readonly aspectRatio = input<string>('');
}
