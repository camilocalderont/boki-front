import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BkCardComponent, BkSpinnerComponent } from '@shared/ui';
import { BkStatCardComponent } from '@widgets/stat-card';
import { CompanyStore } from '@features/manage-company';
import { CompanyApiService } from '@entities/company';
import { AppointmentApiService } from '@entities/appointment';
import { AppointmentStore } from '@features/manage-appointments';

@Component({
  standalone: true,
  selector: 'bk-dashboard-page',
  imports: [RouterModule, BkCardComponent, BkSpinnerComponent, BkStatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-dashboard-page">
      <div class="bk-dashboard-page__header">
        <div>
          <h1 class="bk-dashboard-page__title">Dashboard</h1>
          <p class="bk-dashboard-page__subtitle">Resumen general de tu negocio</p>
        </div>
      </div>

      @if (companyStore.loading() || appointmentStore.loading()) {
        <div class="bk-dashboard-page__loader">
          <bk-spinner />
        </div>
      } @else {
        <div class="bk-dashboard-page__stats">
          <bk-stat-card
            label="Empresas activas"
            [value]="companyStore.items().length"
            icon="building"
            color="primary"
          />
          <bk-stat-card
            label="Citas registradas"
            [value]="appointmentStore.items().length"
            icon="calendar"
            color="success"
          />
          <bk-stat-card
            label="Profesionales"
            [value]="0"
            icon="users"
            color="info"
          />
          <bk-stat-card
            label="Servicios"
            [value]="0"
            icon="layers"
            color="warning"
          />
        </div>

        <div class="bk-dashboard-page__sections">
          <bk-card>
            <h2 class="bk-dashboard-page__section-title">Actividad Reciente</h2>
            <div class="bk-dashboard-page__activity-list">
              <div class="bk-dashboard-page__activity-item">
                <div class="bk-dashboard-page__activity-dot bk-dashboard-page__activity-dot--success"></div>
                <span class="bk-dashboard-page__activity-text">Sistema iniciado correctamente</span>
                <span class="bk-dashboard-page__activity-time">Ahora</span>
              </div>
            </div>
          </bk-card>

          <bk-card>
            <h2 class="bk-dashboard-page__section-title">Acciones Rápidas</h2>
            <div class="bk-dashboard-page__quick-actions">
              <a class="bk-dashboard-page__quick-action" routerLink="../company">
                <span class="bk-dashboard-page__quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/></svg>
                </span>
                <span>Gestionar Empresas</span>
              </a>
              <a class="bk-dashboard-page__quick-action" routerLink="../catalog">
                <span class="bk-dashboard-page__quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                </span>
                <span>Ver Catálogo</span>
              </a>
              <a class="bk-dashboard-page__quick-action" routerLink="../appointments">
                <span class="bk-dashboard-page__quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <span>Ver Citas</span>
              </a>
            </div>
          </bk-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .bk-dashboard-page { padding: 24px 0; }

    .bk-dashboard-page__header { margin-bottom: 24px; }

    .bk-dashboard-page__title {
      font-size: var(--bk-font-size-xl, 20px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .bk-dashboard-page__subtitle {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted);
      margin-top: 4px;
    }

    .bk-dashboard-page__loader {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .bk-dashboard-page__stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 1024px) {
      .bk-dashboard-page__stats { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .bk-dashboard-page__stats { grid-template-columns: 1fr; }
    }

    .bk-dashboard-page__sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .bk-dashboard-page__sections { grid-template-columns: 1fr; }
    }

    .bk-dashboard-page__section-title {
      font-size: var(--bk-font-size-base, 14px);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      margin: 0 0 16px 0;
    }

    .bk-dashboard-page__activity-list { display: flex; flex-direction: column; gap: 12px; }

    .bk-dashboard-page__activity-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--bk-font-size-sm, 12px);
    }

    .bk-dashboard-page__activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .bk-dashboard-page__activity-dot--success {
      background: var(--bk-color-success, #10B981);
    }

    .bk-dashboard-page__activity-text {
      flex: 1;
      color: var(--bk-color-text-primary);
    }

    .bk-dashboard-page__activity-time {
      color: var(--bk-color-text-muted);
      font-size: var(--bk-font-size-sm, 12px);
    }

    .bk-dashboard-page__quick-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bk-dashboard-page__quick-action {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--bk-border-radius-md, 8px);
      color: var(--bk-color-text-primary);
      text-decoration: none;
      font-size: var(--bk-font-size-sm, 12px);
      font-weight: 500;
      transition: background 0.15s;
      cursor: pointer;
    }

    .bk-dashboard-page__quick-action:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 5%, transparent);
      color: var(--bk-color-primary, #2563EB);
    }

    .bk-dashboard-page__quick-action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bk-color-text-muted);
    }

    .bk-dashboard-page__quick-action:hover .bk-dashboard-page__quick-action-icon {
      color: var(--bk-color-primary, #2563EB);
    }
  `],
})
export class DashboardPageComponent implements OnInit {
  protected companyStore = inject(CompanyStore);
  protected appointmentStore = inject(AppointmentStore);
  private companyApi = inject(CompanyApiService);
  private appointmentApi = inject(AppointmentApiService);

  ngOnInit(): void {
    this.companyApi.getAll().subscribe({
      next: (res) => this.companyStore.setItems(res.data ?? []),
      error: () => {},
    });
    this.appointmentApi.getAll().subscribe({
      next: (res) => this.appointmentStore.setItems(res.data ?? []),
      error: () => {},
    });
  }
}
