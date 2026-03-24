import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from '@angular/core';
import { ThemeService } from '@shared/tokens';

@Component({
  selector: 'bk-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bk-header">
      <div class="bk-header__left">
        @if (showSidebarToggle()) {
          <button
            type="button"
            class="bk-header__menu-btn"
            aria-label="Alternar menú lateral"
            (click)="sidebarToggle.emit()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        }

        @if (themeService.logo(); as logo) {
          <img
            class="bk-header__logo"
            [src]="logo.url"
            [alt]="logo.altText"
            [style.width.px]="logo.width ?? 120"
          />
        }

        @if (title()) {
          <h1 class="bk-header__title">{{ title() }}</h1>
        }
      </div>

      <div class="bk-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .bk-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--bk-size-header-height, 56px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--bk-space-md, 1rem);
      background: var(--bk-bg-surface, #ffffff);
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
      z-index: calc(var(--bk-z-dropdown, 100) + 1);
    }

    .bk-header__left {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.5rem);
      min-width: 0;
    }

    .bk-header__menu-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--bk-border-radius-md, 8px);
      background: transparent;
      color: var(--bk-color-text-secondary, #6b7280);
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .bk-header__menu-btn:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 10%, transparent);
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-header__logo {
      height: 32px;
      width: auto;
      object-fit: contain;
    }

    .bk-header__title {
      margin: 0;
      font-size: var(--bk-font-size-lg, 1.125rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bk-header__actions {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.5rem);
      flex-shrink: 0;
    }
  `,
})
export class BkHeaderComponent {
  protected readonly themeService = inject(ThemeService);

  /** Title displayed in the header bar. */
  readonly title = input<string>('');

  /** Whether to show the sidebar toggle (hamburger) button. */
  readonly showSidebarToggle = input<boolean>(true);

  /** Emitted when the sidebar toggle button is clicked. */
  readonly sidebarToggle = output<void>();

  /** Resolved logo URL from ThemeService. */
  protected readonly logoUrl = this.themeService.logo;
}
