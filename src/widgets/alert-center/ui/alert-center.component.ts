import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertService } from '@shared/lib';
import type { AlertType } from '@shared/lib';

@Component({
  selector: 'bk-alert-center',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-alert-center" aria-live="polite" aria-relevant="additions removals">
      @for (alert of alertService.alerts(); track alert.id) {
        <div
          class="bk-alert-toast"
          [class]="'bk-alert-toast bk-alert-toast--' + alert.type"
          role="alert"
        >
          <span class="bk-alert-toast__icon" [innerHTML]="getAlertIcon(alert.type)"></span>
          <span class="bk-alert-toast__message">{{ alert.message }}</span>
          <button
            type="button"
            class="bk-alert-toast__close"
            aria-label="Cerrar alerta"
            (click)="alertService.dismiss(alert.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .bk-alert-center {
      position: fixed;
      top: calc(var(--bk-size-header-height, 56px) + var(--bk-space-md, 1rem));
      right: var(--bk-space-md, 1rem);
      z-index: calc(var(--bk-z-modal, 1000) + 10);
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-sm, 0.5rem);
      max-width: 400px;
      width: 100%;
      pointer-events: none;
    }

    .bk-alert-toast {
      display: flex;
      align-items: flex-start;
      gap: var(--bk-space-sm, 0.5rem);
      padding: var(--bk-space-sm, 0.75rem) var(--bk-space-md, 1rem);
      border-radius: var(--bk-border-radius-md, 8px);
      background: var(--bk-bg-surface, #ffffff);
      box-shadow: var(--bk-shadow-lg, 0 10px 40px rgba(0, 0, 0, 0.12));
      border-left: 4px solid transparent;
      pointer-events: auto;
      animation: bk-alert-slide-in 0.3s ease-out;
    }

    .bk-alert-toast--success {
      border-left-color: var(--bk-color-success, #10b981);
    }

    .bk-alert-toast--error {
      border-left-color: var(--bk-color-danger, #ef4444);
    }

    .bk-alert-toast--warning {
      border-left-color: var(--bk-color-warning, #f59e0b);
    }

    .bk-alert-toast--info {
      border-left-color: var(--bk-color-info, #3b82f6);
    }

    .bk-alert-toast__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .bk-alert-toast--success .bk-alert-toast__icon {
      color: var(--bk-color-success, #10b981);
    }

    .bk-alert-toast--error .bk-alert-toast__icon {
      color: var(--bk-color-danger, #ef4444);
    }

    .bk-alert-toast--warning .bk-alert-toast__icon {
      color: var(--bk-color-warning, #f59e0b);
    }

    .bk-alert-toast--info .bk-alert-toast__icon {
      color: var(--bk-color-info, #3b82f6);
    }

    .bk-alert-toast__icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .bk-alert-toast__message {
      flex: 1;
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-primary, #111827);
      line-height: 1.4;
    }

    .bk-alert-toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: var(--bk-border-radius-sm, 4px);
      background: transparent;
      color: var(--bk-color-text-muted, #9ca3af);
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .bk-alert-toast__close:hover {
      background: color-mix(in srgb, var(--bk-color-text-muted, #9ca3af) 12%, transparent);
      color: var(--bk-color-text-primary, #111827);
    }

    @keyframes bk-alert-slide-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
})
export class BkAlertCenterComponent {
  protected readonly alertService = inject(AlertService);
  private readonly sanitizer = inject(DomSanitizer);

  getAlertIcon(type: AlertType): SafeHtml {
    const icons: Record<AlertType, string> = {
      success:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    return this.sanitizer.bypassSecurityTrustHtml(icons[type]);
  }
}
