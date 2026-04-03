import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { BkIconComponent, BkSpinnerComponent } from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type { ClientProfile } from '@entities/public-booking';

@Component({
  standalone: true,
  selector: 'bk-client-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BkIconComponent, BkSpinnerComponent],
  styles: `
    :host {
      display: flex;
      min-height: 100vh;
      background: var(--bk-bg-page, #f8fafc);
    }

    .dashboard-sidebar {
      width: 260px;
      flex-shrink: 0;
      background: var(--bk-bg-surface, #fff);
      border-right: 1px solid var(--bk-border-color-default, #e2e8f0);
      display: flex;
      flex-direction: column;
      padding: var(--bk-space-lg, 1.5rem) 0;
    }

    .sidebar-header {
      padding: 0 var(--bk-space-lg, 1.5rem) var(--bk-space-lg, 1.5rem);
      border-bottom: 1px solid var(--bk-border-color-default, #e2e8f0);
      margin-bottom: var(--bk-space-md, 1rem);
    }

    .avatar-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bk-color-primary, #6366f1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--bk-font-size-lg, 1rem);
      font-weight: 700;
      margin-bottom: var(--bk-space-sm, 0.75rem);
    }

    .client-name {
      font-size: var(--bk-font-size-base, 0.875rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1e293b);
      line-height: 1.3;
    }

    .client-email {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-text-muted, #94a3b8);
      margin-top: 2px;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0 var(--bk-space-sm, 0.75rem);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm, 0.75rem);
      padding: 10px var(--bk-space-md, 1rem);
      border-radius: var(--bk-border-radius-lg, 8px);
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748b);
      text-decoration: none;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .nav-link:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 8%, transparent);
      color: var(--bk-color-primary, #6366f1);
    }

    .nav-link.active {
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 12%, transparent);
      color: var(--bk-color-primary, #6366f1);
      font-weight: 600;
    }

    .dashboard-content {
      flex: 1;
      overflow: auto;
      padding: var(--bk-space-xl, 2rem);
    }

    @media (max-width: 768px) {
      :host {
        flex-direction: column;
      }

      .dashboard-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--bk-border-color-default, #e2e8f0);
        padding: var(--bk-space-md, 1rem) 0;
      }

      .sidebar-header {
        padding: 0 var(--bk-space-md, 1rem) var(--bk-space-md, 1rem);
      }

      .nav-list {
        flex-direction: row;
        padding: 0 var(--bk-space-md, 1rem);
        gap: var(--bk-space-xs, 0.5rem);
      }

      .nav-link {
        flex: 1;
        justify-content: center;
        padding: 8px var(--bk-space-sm, 0.75rem);
      }

      .dashboard-content {
        padding: var(--bk-space-lg, 1.5rem) var(--bk-space-md, 1rem);
      }
    }
  `,
  template: `
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        @if (loading()) {
          <bk-spinner size="sm" />
        } @else if (profile(); as p) {
          <div class="avatar-circle">{{ initials() }}</div>
          <div class="client-name">{{ p.VcFirstName }} {{ p.VcFirstLastName }}</div>
          @if (p.VcEmail) {
            <div class="client-email">{{ p.VcEmail }}</div>
          }
        }
      </div>

      <ul class="nav-list">
        <li>
          <a
            class="nav-link"
            [routerLink]="['historial']"
            routerLinkActive="active"
          >
            <bk-icon name="calendar" size="sm" />
            Historial
          </a>
        </li>
        <li>
          <a
            class="nav-link"
            [routerLink]="['perfil']"
            routerLinkActive="active"
          >
            <bk-icon name="users" size="sm" />
            Perfil
          </a>
        </li>
        <li>
          <a
            class="nav-link"
            [routerLink]="['ajustes']"
            routerLinkActive="active"
          >
            <bk-icon name="edit" size="sm" />
            Ajustes
          </a>
        </li>
      </ul>
    </aside>

    <main class="dashboard-content">
      <router-outlet />
    </main>
  `,
})
export class ClientDashboardLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  readonly profile = signal<ClientProfile | null>(null);
  readonly loading = signal(true);
  readonly token = signal('');

  readonly initials = () => {
    const p = this.profile();
    if (!p) return '?';
    const first = p.VcFirstName?.charAt(0)?.toUpperCase() ?? '';
    const last = p.VcFirstLastName?.charAt(0)?.toUpperCase() ?? '';
    return `${first}${last}` || '?';
  };

  ngOnInit(): void {
    const token = this.route.snapshot.params['token'] as string;
    this.token.set(token);

    if (!token) {
      this.loading.set(false);
      return;
    }

    this.api.getClientProfile(token).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
