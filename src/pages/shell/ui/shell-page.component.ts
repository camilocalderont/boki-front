import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { BkLayoutShellComponent } from '@widgets/layout-shell';
import { SidebarItem } from '@widgets/sidebar';
import { AuthStore } from '@features/auth';

@Component({
  standalone: true,
  selector: 'bk-shell-page',
  imports: [BkLayoutShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bk-layout-shell [sidebarItems]="sidebarItems()" [showSidebar]="true">
      <div class="bk-shell-page__user-actions" header-actions>
        <button
          class="bk-shell-page__logout-btn"
          (click)="authStore.logout()"
          title="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </bk-layout-shell>
  `,
  styles: [`
    .bk-shell-page__user-actions { display: flex; align-items: center; gap: var(--bk-space-sm, 8px); }
    .bk-shell-page__logout-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border: none; border-radius: var(--bk-border-radius-md, 8px);
      background: transparent; color: var(--bk-color-text-secondary, #4B5563);
      cursor: pointer; transition: background-color 0.2s, color 0.2s;
    }
    .bk-shell-page__logout-btn:hover {
      background: color-mix(in srgb, var(--bk-color-danger, #EF4444) 10%, transparent);
      color: var(--bk-color-danger, #EF4444);
    }
  `],
})
export class ShellPageComponent implements OnInit {
  protected authStore = inject(AuthStore);
  private http = inject(HttpClient);

  sidebarItems = signal<SidebarItem[]>([]);

  ngOnInit(): void {
    this.http.get<{ items: SidebarItem[] }>('assets/config/navigation.json').pipe(
      map(config => config.items
        .filter((item: any) => item.visible)
        .sort((a: any, b: any) => a.order - b.order)
        .map((item: any) => ({ id: item.label, label: item.label, icon: item.icon, route: item.route }))
      ),
      catchError(() => of([])),
    ).subscribe(items => this.sidebarItems.set(items));
  }
}
