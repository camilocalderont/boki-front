import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@features/theme-toggle';

@Component({
  standalone: true,
  selector: 'bk-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ThemeToggleComponent],
  host: { class: 'bk-public-layout' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .public-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--bk-size-header-height, 56px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--bk-space-lg, 1.5rem);
      background: var(--bk-bg-surface, #ffffff);
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
      z-index: calc(var(--bk-z-modal, 1050) + 10);
      gap: var(--bk-space-md, 1rem);
    }

    .public-header__logo {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: var(--bk-font-weight-bold, 600);
      color: var(--bk-color-text-primary, #111827);
      letter-spacing: -0.025em;
      flex-shrink: 0;
    }

    .public-header__search {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: var(--bk-bg-page);
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-full, 9999px);
      overflow: hidden;
      max-width: 500px;
      width: 100%;
    }

    .search-segment {
      padding: var(--bk-space-xs, 4px) var(--bk-space-md, 16px);
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      border-right: 1px solid var(--bk-border-color-default);
      white-space: nowrap;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-segment:last-of-type {
      border-right: none;
    }

    .search-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bk-color-text-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 4px;
      flex-shrink: 0;
      border: none;
      cursor: pointer;
    }

    .search-btn:hover {
      opacity: 0.85;
    }

    .public-header__actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    @media (max-width: 767px) {
      .public-header__search {
        display: none;
      }
    }

    .public-main {
      flex: 1;
      padding-top: var(--bk-size-header-height, 56px);
    }

    .public-footer {
      padding: var(--bk-space-md, 1rem) 0;
      text-align: center;
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-text-muted, #94A3B8);
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
      background: var(--bk-bg-surface, #ffffff);
    }

    .public-footer__brand {
      font-weight: var(--bk-font-weight-bold, 600);
      color: var(--bk-color-text-secondary, #64748B);
    }
  `,
  template: `
    <header class="public-header">
      <!-- Logo izquierda -->
      <span class="public-header__logo">Boki</span>

      <!-- Search bar centrada (solo visible en md+) -->
      <div class="public-header__search">
        <div class="search-bar">
          <span class="search-segment">Todos los tratamientos</span>
          <span class="search-segment">Ubicación</span>
          <span class="search-segment">En cualquier momento</span>
          <button class="search-btn" type="button" aria-label="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Theme toggle derecha -->
      <div class="public-header__actions">
        <bk-theme-toggle />
      </div>
    </header>

    <main class="public-main">
      <router-outlet />
    </main>

    <footer class="public-footer">
      <span>Powered by </span>
      <span class="public-footer__brand">Solercia</span>
    </footer>
  `,
})
export class PublicLayoutComponent {}
