import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BkCardComponent, BkButtonComponent, BkSpinnerComponent, BkIconComponent, BkBadgeComponent } from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type { PublicAppointment } from '@entities/public-booking';

@Component({
  standalone: true,
  selector: 'bk-public-appointment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkCardComponent, BkButtonComponent, BkSpinnerComponent, BkIconComponent, BkBadgeComponent, DecimalPipe],
  styles: `
    :host { display: block; }
    .appointment-container {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--bk-space-xl, 2rem) var(--bk-space-lg, 1.5rem);
    }
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--bk-color-success, #10B981);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--bk-space-lg);
      color: #fff;
      font-size: 2rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: var(--bk-space-sm) 0;
      font-size: var(--bk-font-size-sm);
    }
    .detail-label { color: var(--bk-color-text-muted); }
    .detail-value { color: var(--bk-color-text-primary); font-weight: 600; }
  `,
  template: `
    <div class="appointment-container">
      @if (loading()) {
        <div class="flex items-center justify-center min-h-[40vh]">
          <bk-spinner size="lg" />
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center text-center py-16">
          <span class="text-5xl mb-4">❌</span>
          <h1 class="text-xl font-bold mb-2" style="color: var(--bk-color-text-primary)">{{ error() }}</h1>
          <p class="text-sm mb-6" style="color: var(--bk-color-text-muted)">{{ errorDetail() }}</p>
          <bk-button variant="primary" (clicked)="goHome()">Volver al inicio</bk-button>
        </div>
      } @else if (appointment(); as appt) {
        <div class="text-center mb-8">
          @if (isConfirming()) {
            <div class="success-icon">✓</div>
            <h1 class="text-2xl font-bold mb-2" style="color: var(--bk-color-text-primary)">¡Cita confirmada!</h1>
            <p class="text-sm" style="color: var(--bk-color-text-muted)">Tu cita ha sido confirmada exitosamente.</p>
          } @else {
            <span class="text-5xl block mb-4">📅</span>
            <h1 class="text-2xl font-bold mb-2" style="color: var(--bk-color-text-primary)">Detalle de tu cita</h1>
            <bk-badge [variant]="appt.CurrentState.VcName === 'Confirmada' ? 'success' : appt.CurrentState.VcName === 'Cancelada' ? 'danger' : 'info'">
              {{ appt.CurrentState.VcName }}
            </bk-badge>
          }
        </div>

        <bk-card [padding]="true">
          <div class="detail-row" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <span class="detail-label">Fecha</span>
            <span class="detail-value">{{ formatAppointmentDate(appt.DtDate) }}</span>
          </div>
          <div class="detail-row" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <span class="detail-label">Servicio</span>
            <span class="detail-value">{{ appt.Service.VcName }}</span>
          </div>
          <div class="detail-row" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <span class="detail-label">Profesional</span>
            <span class="detail-value">{{ appt.Professional.VcFirstName }} {{ appt.Professional.VcFirstLastName }}</span>
          </div>
          <div class="detail-row" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <span class="detail-label">Horario</span>
            <span class="detail-value">{{ appt.TStartTime?.substring(0,5) }} - {{ appt.TEndTime?.substring(0,5) }}</span>
          </div>
          <div class="detail-row" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <span class="detail-label">Duración</span>
            <span class="detail-value">{{ appt.Service.VcTime }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Precio</span>
            <span class="detail-value" style="color: var(--bk-color-primary)">{{ '$' + (appt.Service.IMinimalPrice | number:'1.0-0') }}</span>
          </div>
        </bk-card>

        <div class="flex flex-col gap-3 mt-6">
          @if (appt.CurrentState.VcName !== 'Cancelada' && appt.CurrentState.VcName !== 'Confirmada' && !isConfirming()) {
            <bk-button variant="primary" (clicked)="confirmAppointment()">Confirmar mi cita</bk-button>
          }
          <bk-button variant="ghost" (clicked)="goHome()">Volver al inicio</bk-button>
        </div>
      }
    </div>
  `,
})
export class PublicAppointmentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PublicBookingApiService);

  appointment = signal<PublicAppointment | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  errorDetail = signal('');
  isConfirming = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.params['token'] as string;
    const isConfirmRoute = this.route.snapshot.url.some(s => s.path === 'confirmar');

    if (!token) {
      this.error.set('Token no proporcionado');
      this.loading.set(false);
      return;
    }

    if (isConfirmRoute) {
      // Auto-confirm from email link
      this.api.confirmAppointment(token).subscribe({
        next: (res) => {
          this.appointment.set(res.data);
          this.isConfirming.set(true);
          this.loading.set(false);
        },
        error: () => {
          // If confirm fails, try to just load the appointment
          this.loadAppointment(token);
        },
      });
    } else {
      this.loadAppointment(token);
    }
  }

  private loadAppointment(token: string): void {
    this.api.getAppointmentByToken(token).subscribe({
      next: (res) => {
        this.appointment.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Cita no encontrada');
        this.errorDetail.set('No pudimos encontrar una cita con ese enlace. Verifica que el enlace sea correcto.');
        this.loading.set(false);
      },
    });
  }

  confirmAppointment(): void {
    const appt = this.appointment();
    if (!appt) return;
    this.api.confirmAppointment(appt.VcPublicToken).subscribe({
      next: (res) => {
        this.appointment.set(res.data);
        this.isConfirming.set(true);
      },
    });
  }

  formatAppointmentDate(dtDate: string): string {
    if (!dtDate) return '';
    const dateStr = dtDate.split(' ')[0].split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
