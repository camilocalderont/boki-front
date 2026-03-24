import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export type BkButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type BkButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bk-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="cssClass()"
      [disabled]="disabled() || loading()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <svg
          class="bk-btn__spinner"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray="31.4 31.4"
            stroke-linecap="round"
          />
        </svg>
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;

      /* ---- colour tokens ---- */
      --bk-btn-primary-bg: var(--bk-color-primary, #6366f1);
      --bk-btn-primary-text: var(--bk-color-primary-contrast, #ffffff);
      --bk-btn-secondary-bg: var(--bk-color-secondary, #e2e8f0);
      --bk-btn-secondary-text: var(--bk-color-secondary-contrast, #1e293b);
      --bk-btn-danger-bg: var(--bk-color-danger, #ef4444);
      --bk-btn-danger-text: var(--bk-color-danger-contrast, #ffffff);
      --bk-btn-ghost-bg: transparent;
      --bk-btn-ghost-text: var(--bk-color-primary, #6366f1);

      /* ---- size tokens ---- */
      --bk-btn-font-sm: var(--bk-font-size-sm, 0.75rem);
      --bk-btn-font-md: var(--bk-font-size-md, 0.875rem);
      --bk-btn-font-lg: var(--bk-font-size-lg, 1rem);
      --bk-btn-padding-sm: var(--bk-spacing-xs, 0.25rem) var(--bk-spacing-sm, 0.5rem);
      --bk-btn-padding-md: var(--bk-spacing-sm, 0.5rem) var(--bk-spacing-md, 1rem);
      --bk-btn-padding-lg: var(--bk-spacing-md, 0.75rem) var(--bk-spacing-lg, 1.5rem);

      /* ---- shared tokens ---- */
      --bk-btn-radius: var(--bk-border-radius, 0.5rem);
      --bk-btn-font-weight: var(--bk-font-weight-medium, 500);
      --bk-btn-transition: var(--bk-transition-fast, 150ms ease);
      --bk-btn-focus-ring: var(--bk-focus-ring, 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 40%, transparent));
      --bk-btn-disabled-opacity: var(--bk-disabled-opacity, 0.55);
    }

    .bk-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
      border: none;
      border-radius: var(--bk-btn-radius);
      font-family: inherit;
      font-weight: var(--bk-btn-font-weight);
      line-height: 1;
      cursor: pointer;
      transition: background-color var(--bk-btn-transition),
                  box-shadow var(--bk-btn-transition),
                  opacity var(--bk-btn-transition);
      white-space: nowrap;
      user-select: none;
    }

    .bk-btn:focus-visible {
      outline: none;
      box-shadow: var(--bk-btn-focus-ring);
    }

    .bk-btn:disabled {
      cursor: not-allowed;
      opacity: var(--bk-btn-disabled-opacity);
    }

    /* ---- variants ---- */

    .bk-btn--primary {
      background-color: var(--bk-btn-primary-bg);
      color: var(--bk-btn-primary-text);
    }
    .bk-btn--primary:hover:not(:disabled) {
      filter: brightness(1.05);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
    .bk-btn--primary:active:not(:disabled) {
      transform: scale(0.98);
      filter: brightness(0.95);
    }

    .bk-btn--secondary {
      background-color: var(--bk-btn-secondary-bg);
      color: var(--bk-btn-secondary-text);
    }
    .bk-btn--secondary:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-secondary-bg) 80%, black);
    }
    .bk-btn--secondary:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-secondary-bg) 70%, black);
    }

    .bk-btn--danger {
      background-color: var(--bk-btn-danger-bg);
      color: var(--bk-btn-danger-text);
    }
    .bk-btn--danger:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-danger-bg) 85%, black);
    }
    .bk-btn--danger:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-danger-bg) 75%, black);
    }

    .bk-btn--ghost {
      background-color: var(--bk-btn-ghost-bg);
      color: var(--bk-btn-ghost-text);
    }
    .bk-btn--ghost:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-ghost-text) 10%, transparent);
    }
    .bk-btn--ghost:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--bk-btn-ghost-text) 18%, transparent);
    }

    /* ---- sizes ---- */

    .bk-btn--sm {
      font-size: var(--bk-font-size-sm, 12px);
      height: 32px;
      padding: 0 12px;
    }
    .bk-btn--md {
      font-size: var(--bk-font-size-base, 14px);
      height: 36px;
      padding: 0 16px;
    }
    .bk-btn--lg {
      font-size: var(--bk-font-size-base, 14px);
      height: 40px;
      padding: 0 20px;
    }

    /* ---- spinner ---- */

    .bk-btn__spinner {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      animation: bk-spin 0.75s linear infinite;
    }

    @keyframes bk-spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class BkButtonComponent {
  /** Visual style variant. */
  readonly variant = input<BkButtonVariant>('primary');

  /** Size preset. */
  readonly size = input<BkButtonSize>('md');

  /** Whether the button is disabled. */
  readonly disabled = input<boolean>(false);

  /** Native button type attribute. */
  readonly type = input<string>('button');

  /** Shows a spinner and disables the button. */
  readonly loading = input<boolean>(false);

  /** Emitted on click when the button is not disabled or loading. */
  readonly clicked = output<void>();

  /** Computed CSS class string combining variant and size modifiers. */
  readonly cssClass = computed(
    () => `bk-btn bk-btn--${this.variant()} bk-btn--${this.size()}`,
  );

  onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.stopPropagation();
      return;
    }
    this.clicked.emit();
  }
}
