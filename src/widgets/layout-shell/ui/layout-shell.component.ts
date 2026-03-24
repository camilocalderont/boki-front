import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BkHeaderComponent } from '@widgets/header';
import { BkSidebarComponent, SidebarItem } from '@widgets/sidebar';
import { ThemeToggleComponent } from '@features/theme-toggle';

@Component({
  selector: 'bk-layout-shell',
  standalone: true,
  imports: [RouterOutlet, BkHeaderComponent, BkSidebarComponent, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bk-header
      [showSidebarToggle]="showSidebar()"
      (sidebarToggle)="onSidebarToggle()"
    >
      <bk-theme-toggle />
      <ng-content select="[header-actions]" />
    </bk-header>

    @if (showSidebar()) {
      <bk-sidebar
        [items]="sidebarItems()"
        [collapsed]="sidebarCollapsed()"
        (collapsedChange)="sidebarCollapsed.set($event)"
      />
    }

    <main
      class="bk-layout-main"
      [class.bk-layout-main--with-sidebar]="showSidebar()"
      [class.bk-layout-main--collapsed]="showSidebar() && sidebarCollapsed()"
    >
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .bk-layout-main {
      padding-top: var(--bk-size-header-height, 56px);
      min-height: 100vh;
      transition: margin-left 0.25s ease;
      padding-left: 24px;
      padding-right: 24px;
      padding-bottom: 24px;
    }

    .bk-layout-main--with-sidebar {
      margin-left: var(--bk-size-sidebar-width, 260px);
    }

    .bk-layout-main--collapsed {
      margin-left: 64px;
    }
  `,
})
export class BkLayoutShellComponent {
  /** List of sidebar navigation items. */
  readonly sidebarItems = input<SidebarItem[]>([]);

  /** Whether to show the sidebar. */
  readonly showSidebar = input<boolean>(true);

  /** Internal collapsed state for the sidebar. */
  readonly sidebarCollapsed = signal(false);

  onSidebarToggle(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
