import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SidebarItem } from '../model/sidebar.model';

@Component({
  selector: 'bk-sidebar',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="bk-sidebar"
      [class.bk-sidebar--collapsed]="collapsed()"
    >
      <nav class="bk-sidebar__nav" aria-label="Navegación principal">
        @for (item of visibleItems(); track item.id) {
          <a
            class="bk-sidebar__item"
            [routerLink]="item.route"
            routerLinkActive="bk-sidebar__item--active"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="bk-sidebar__icon" [innerHTML]="getIcon(item.icon)"></span>

            @if (!collapsed()) {
              <span class="bk-sidebar__label">{{ item.label }}</span>

              @if (item.badge !== undefined && item.badge !== null) {
                <span class="bk-sidebar__badge">{{ item.badge }}</span>
              }
            }
          </a>

          @if (!collapsed() && item.children?.length) {
            <div class="bk-sidebar__children">
              @for (child of item.children; track child.id) {
                <a
                  class="bk-sidebar__item bk-sidebar__item--child"
                  [routerLink]="child.route"
                  routerLinkActive="bk-sidebar__item--active"
                >
                  <span class="bk-sidebar__icon bk-sidebar__icon--sm" [innerHTML]="getIcon(child.icon)"></span>
                  <span class="bk-sidebar__label">{{ child.label }}</span>

                  @if (child.badge !== undefined && child.badge !== null) {
                    <span class="bk-sidebar__badge">{{ child.badge }}</span>
                  }
                </a>
              }
            </div>
          }
        }
      </nav>

      <button
        type="button"
        class="bk-sidebar__toggle"
        (click)="onToggleCollapse()"
        [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [class.bk-sidebar__toggle-icon--flipped]="collapsed()"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  `,
  styles: `
    .bk-sidebar {
      position: fixed;
      top: var(--bk-size-header-height, 56px);
      left: 0;
      bottom: 0;
      width: var(--bk-size-sidebar-width, 260px);
      display: flex;
      flex-direction: column;
      background: var(--bk-bg-surface, #ffffff);
      border-right: 1px solid var(--bk-border-color-default, #e5e7eb);
      transition: width 0.25s ease;
      z-index: var(--bk-z-dropdown, 100);
      overflow: hidden;
    }

    .bk-sidebar--collapsed {
      width: 64px;
    }

    .bk-sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: var(--bk-space-sm, 0.5rem);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bk-sidebar__item {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.5rem);
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 0.75rem);
      border-radius: var(--bk-border-radius-md, 8px);
      color: var(--bk-color-text-secondary, #6b7280);
      text-decoration: none;
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .bk-sidebar__item:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 5%, transparent);
      color: var(--bk-color-primary, #2563EB);
    }

    .bk-sidebar__item--active {
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 10%, transparent);
      color: var(--bk-color-primary, #2563EB);
      font-weight: 600;
      border-left: 3px solid var(--bk-color-primary, #2563EB);
      padding-left: calc(var(--bk-space-md, 0.75rem) - 3px);
    }

    .bk-sidebar__item--child {
      padding-left: calc(var(--bk-space-md, 0.75rem) + 1.5rem);
      font-size: var(--bk-font-size-sm, 0.8125rem);
    }

    .bk-sidebar__children {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .bk-sidebar__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .bk-sidebar__icon--sm {
      width: 16px;
      height: 16px;
    }

    .bk-sidebar__icon ::ng-deep svg {
      width: 100%;
      height: 100%;
    }

    .bk-sidebar__label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bk-sidebar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: var(--bk-border-radius-full, 9999px);
      background: var(--bk-color-primary, #6366f1);
      color: #ffffff;
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1;
    }

    .bk-sidebar__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      margin: var(--bk-space-xs, 0.25rem) var(--bk-space-sm, 0.5rem);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
      background: transparent;
      color: var(--bk-color-text-secondary, #6b7280);
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .bk-sidebar__toggle:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 8%, transparent);
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-sidebar__toggle-icon--flipped {
      transform: rotate(180deg);
    }
  `,
})
export class BkSidebarComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** List of sidebar navigation items. */
  readonly items = input<SidebarItem[]>([]);

  /** Whether the sidebar is in collapsed (icon-only) mode. */
  readonly collapsed = input<boolean>(false);

  /** Emitted when the collapsed state changes. */
  readonly collapsedChange = output<boolean>();

  /** Emitted when a navigation item is clicked. */
  readonly navigate = output<string>();

  /** Computed list filtering out items where visible === false. */
  readonly visibleItems = computed(() =>
    this.items().filter(item => item.visible !== false),
  );

  onToggleCollapse(): void {
    this.collapsedChange.emit(!this.collapsed());
  }

  /**
   * Returns an inline SVG string for common icon names.
   * Falls back to a generic circle for unknown icons.
   */
  getIcon(icon: string): SafeHtml {
    const icons: Record<string, string> = {
      home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      briefcase: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      question: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      users: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      'message-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      building: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/></svg>',
      'help-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      layers: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      tag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      'credit-card': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      'bar-chart': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
      clipboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    };

    const svg = icons[icon] ??
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>';
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
