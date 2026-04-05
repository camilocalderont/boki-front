import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_REGISTRY } from './icon.registry';

export type BkIconSize    = 'sm' | 'md' | 'lg';
export type BkIconVariant = 'outline' | 'fill';

/** All valid icon names. Add here when you extend icon.registry.ts. */
export type BkIconName = keyof typeof ICON_REGISTRY;

@Component({
  selector: 'bk-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="bk-icon" [class]="sizeClass()" [innerHTML]="svg()"></span>`,
  styles: `
    .bk-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bk-icon :deep(svg) { width: 100%; height: 100%; }

    .bk-icon-sm { width: 16px; height: 16px; }
    .bk-icon-md { width: 20px; height: 20px; }
    .bk-icon-lg { width: 24px; height: 24px; }
  `,
})
export class BkIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Icon name — must exist in ICON_REGISTRY. */
  readonly name = input.required<BkIconName | string>();

  /** Size token. Defaults to 'md' (20 × 20 px). */
  readonly size = input<BkIconSize>('md');

  /**
   * Visual variant:
   *   'outline' — stroke paths on transparent background
   *   'fill'    — solid filled shape
   *
   * Color is controlled via Tailwind's text-* class on the host element.
   * Example: <bk-icon name="edit" variant="fill" class="text-blue-500" />
   */
  readonly variant = input<BkIconVariant>('outline');

  readonly sizeClass = computed(() => `bk-icon bk-icon-${this.size()}`);

  readonly svg = computed((): SafeHtml => {
    const def = ICON_REGISTRY[this.name()];

    const paths = def
      ? (this.variant() === 'fill' ? def.fill : def.outline)
      : '<circle cx="12" cy="12" r="4" />';  // fallback dot for unknown icons

    const isOutline = this.variant() === 'outline';

    const markup = isOutline
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">${paths}</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="currentColor" stroke="none"
             aria-hidden="true">${paths}</svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}
