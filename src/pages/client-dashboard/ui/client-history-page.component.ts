import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  BkCardComponent,
  BkSpinnerComponent,
  BkBadgeComponent,
  BkTabsComponent,
} from '@shared/ui';
import type { BkTabItem } from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type { ClientAppointmentHistory } from '@entities/public-booking';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  standalone: true,
  selector: 'bk-client-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkCardComponent, BkSpinnerComponent, BkBadgeComponent, BkTabsComponent, DecimalPipe],
  styles: `
    :host { display: block; }

    .page-title {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      color: var(--bk-color-text-primary, #1e293b);
      margin: 0 0 var(--bk-space-lg, 1.5rem);
    }

    .tabs-wrap {
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
    }

    .appointment-card {
      cursor: pointer;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--bk-space-sm, 0.75rem);
    }

    .service-name {
      font-size: var(--bk-font-size-base, 0.875rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1e293b);
    }

    .appointment-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bk-space-md, 1rem);
      margin-top: var(--bk-space-xs, 0.5rem);
    }

    .meta-item {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-text-muted, #94a3b8);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-label {
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748b);
    }

    .price {
      font-size: var(--bk-font-size-base, 0.875rem);
      font-weight: 700;
      color: var(--bk-color-primary, #6366f1);
    }

    .empty-state {
      text-align: center;
      padding: var(--bk-space-xl, 2rem);
      color: var(--bk-color-text-muted, #94a3b8);
      font-size: var(--bk-font-size-base, 0.875rem);
    }
  `,
  template: `
    <h1 class="page-title">Historial</h1>

    <div class="tabs-wrap">
      <bk-tabs
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
      />
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <bk-spinner size="lg" />
      </div>
    } @else {
      <div class="appointments-list">
        @for (appt of filteredAppointments(); track appt.Id) {
          <bk-card [hoverable]="true" (click)="viewAppointment(appt.VcPublicToken)">
            <div class="appointment-card">
              <div class="appointment-header">
                <span class="service-name">{{ appt.Service.VcName }}</span>
                <bk-badge [variant]="badgeVariant(appt.CurrentState.VcName)">
                  {{ appt.CurrentState.VcName }}
                </bk-badge>
              </div>

              <div class="appointment-meta">
                <span class="meta-item">
                  <span class="meta-label">Fecha:</span>
                  {{ formatDate(appt.DtDate) }}
                </span>
                <span class="meta-item">
                  <span class="meta-label">Hora:</span>
                  {{ appt.TStartTime?.substring(0, 5) }} - {{ appt.TEndTime?.substring(0, 5) }}
                </span>
                <span class="meta-item">
                  <span class="meta-label">Profesional:</span>
                  {{ appt.Professional.VcFirstName }} {{ appt.Professional.VcFirstLastName }}
                </span>
                <span class="meta-item">
                  <span class="meta-label">Duración:</span>
                  {{ appt.Service.VcTime }}
                </span>
              </div>

              <div class="flex justify-end mt-3">
                <span class="price">{{ '$' + (appt.Service.IMinimalPrice | number:'1.0-0') }}</span>
              </div>
            </div>
          </bk-card>
        } @empty {
          <div class="empty-state">
            No hay citas {{ activeTab() === 'proximas' ? 'próximas' : 'pasadas' }}.
          </div>
        }
      </div>
    }
  `,
})
export class ClientHistoryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PublicBookingApiService);

  readonly tabs: BkTabItem[] = [
    { id: 'proximas', label: 'Próximas' },
    { id: 'pasadas', label: 'Pasadas' },
  ];

  readonly activeTab = signal<string>('proximas');
  readonly loading = signal(true);
  readonly appointments = signal<ClientAppointmentHistory[]>([]);

  readonly filteredAppointments = computed(() => {
    const now = new Date();
    return this.appointments().filter(appt => {
      const date = new Date(appt.DtDate);
      return this.activeTab() === 'proximas' ? date >= now : date < now;
    });
  });

  ngOnInit(): void {
    const token = this.route.parent?.snapshot.params['token'] as string;
    if (!token) {
      this.loading.set(false);
      return;
    }

    this.api.getClientAppointments(token).subscribe({
      next: (res) => {
        this.appointments.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  viewAppointment(token: string): void {
    this.router.navigate(['/cita', token]);
  }

  badgeVariant(stateName: string): BadgeVariant {
    switch (stateName) {
      case 'Confirmada': return 'success';
      case 'Cancelada': return 'danger';
      case 'Completada': return 'neutral';
      default: return 'info';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
