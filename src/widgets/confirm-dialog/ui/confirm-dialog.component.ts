import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
  HostListener,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type ConfirmVariant = 'danger' | 'warning' | 'info';

@Component({
  selector: 'bk-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="bk-confirm-overlay"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        (click)="onBackdropClick()"
      >
        <div
          class="bk-confirm-panel"
          (click)="$event.stopPropagation()"
        >
          <div class="bk-confirm-header">
            <span
              class="bk-confirm-icon"
              [class]="iconClasses()"
              [innerHTML]="variantIcon()"
            ></span>
            <h2 class="bk-confirm-title">{{ title() }}</h2>
          </div>

          @if (message()) {
            <p class="bk-confirm-message">{{ message() }}</p>
          }

          <div class="bk-confirm-actions">
            <button
              type="button"
              [class]="confirmBtnClasses()"
              (click)="onConfirm()"
            >
              {{ confirmLabel() }}
            </button>
            <button
              type="button"
              class="bk-confirm-btn bk-confirm-btn--cancel"
              (click)="onCancel()"
            >
              {{ cancelLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .bk-confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--bk-z-modal, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bk-bg-overlay, rgba(0, 0, 0, 0.5));
      animation: bk-confirm-fade-in 0.15s ease-out;
    }

    .bk-confirm-panel {
      width: min(28rem, 92vw);
      background: var(--bk-bg-surface, #ffffff);
      border-radius: var(--bk-border-radius-lg, 12px);
      box-shadow: var(--bk-shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3));
      padding: var(--bk-space-lg, 1.5rem);
      animation: bk-confirm-scale-in 0.2s ease-out;
    }

    .bk-confirm-header {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.75rem);
      margin-bottom: var(--bk-space-sm, 0.5rem);
    }

    .bk-confirm-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--bk-border-radius-full, 9999px);
      flex-shrink: 0;
    }

    .bk-confirm-icon :deep(svg) {
      width: 22px;
      height: 22px;
    }

    .bk-confirm-icon--danger {
      background: color-mix(in srgb, var(--bk-color-danger, #ef4444) 12%, transparent);
      color: var(--bk-color-danger, #ef4444);
    }

    .bk-confirm-icon--warning {
      background: color-mix(in srgb, var(--bk-color-warning, #f59e0b) 12%, transparent);
      color: var(--bk-color-warning, #f59e0b);
    }

    .bk-confirm-icon--info {
      background: color-mix(in srgb, var(--bk-color-info, #3b82f6) 12%, transparent);
      color: var(--bk-color-info, #3b82f6);
    }

    .bk-confirm-title {
      margin: 0;
      font-size: var(--bk-font-size-lg, 1.125rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
    }

    .bk-confirm-message {
      margin: var(--bk-space-sm, 0.5rem) 0 0 0;
      padding-left: calc(40px + var(--bk-space-sm, 0.75rem));
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-secondary, #6b7280);
      line-height: 1.5;
    }

    .bk-confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--bk-space-sm, 0.5rem);
      margin-top: var(--bk-space-lg, 1.5rem);
    }

    .bk-confirm-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      border: none;
      border-radius: var(--bk-border-radius-md, 8px);
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.15s ease, opacity 0.15s ease;
      line-height: 1;
      min-height: 36px;
    }

    .bk-confirm-btn--cancel {
      background: transparent;
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-confirm-btn--cancel:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 10%, transparent);
    }

    .bk-confirm-btn--danger {
      background: var(--bk-color-danger, #ef4444);
      color: #ffffff;
    }

    .bk-confirm-btn--danger:hover {
      background: color-mix(in srgb, var(--bk-color-danger, #ef4444) 85%, black);
    }

    .bk-confirm-btn--warning {
      background: var(--bk-color-warning, #f59e0b);
      color: #ffffff;
    }

    .bk-confirm-btn--warning:hover {
      background: color-mix(in srgb, var(--bk-color-warning, #f59e0b) 85%, black);
    }

    .bk-confirm-btn--info {
      background: var(--bk-color-info, #3b82f6);
      color: #ffffff;
    }

    .bk-confirm-btn--info:hover {
      background: color-mix(in srgb, var(--bk-color-info, #3b82f6) 85%, black);
    }

    .bk-confirm-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 40%, transparent);
    }

    @keyframes bk-confirm-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes bk-confirm-scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `,
})
export class BkConfirmDialogComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Whether the dialog is open. */
  readonly open = input<boolean>(false);

  /** Title displayed at the top of the dialog. */
  readonly title = input<string>('\u00BFEst\u00E1s seguro?');

  /** Descriptive message shown below the title. */
  readonly message = input<string>('');

  /** Label for the confirm button. */
  readonly confirmLabel = input<string>('Confirmar');

  /** Label for the cancel button. */
  readonly cancelLabel = input<string>('Cancelar');

  /** Visual variant controlling icon and button color. */
  readonly variant = input<ConfirmVariant>('danger');

  /** Emitted when the user confirms the action. */
  readonly confirm = output<void>();

  /** Emitted when the user cancels the action. */
  readonly cancel = output<void>();

  /** Computed CSS classes for the icon container. */
  readonly iconClasses = computed(
    () => `bk-confirm-icon bk-confirm-icon--${this.variant()}`,
  );

  /** Computed CSS classes for the confirm button. */
  readonly confirmBtnClasses = computed(
    () => `bk-confirm-btn bk-confirm-btn--${this.variant()}`,
  );

  /** Returns the sanitized SVG icon markup based on the current variant. */
  readonly variantIcon = computed((): SafeHtml => {
    const icons: Record<ConfirmVariant, string> = {
      danger:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[this.variant()]);
  });

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open()) {
      this.onCancel();
    }
  }

  onBackdropClick(): void {
    this.onCancel();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
