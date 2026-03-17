import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private companyService = inject(CompanyService);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  stats = [
    {
      title: 'Conversaciones activas',
      value: '—',
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: 'chat'
    },
    {
      title: 'Citas programadas',
      value: '—',
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: 'calendar'
    },
    {
      title: 'Empresas registradas',
      value: '—',
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: 'building'
    },
    {
      title: 'Tasa de conversión',
      value: '—',
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: 'chart'
    }
  ];

  recentActivity: { type: string; message: string; time: string; user: string }[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.stats[2].value = String(res.data?.length ?? 0);
      },
      error: () => {
        this.stats[2].value = '0';
      }
    });

    this.appointmentService.getAll().subscribe({
      next: (res) => {
        const appointments = res.data || [];
        this.stats[1].value = String(appointments.length);

        // Map recent appointments to activity feed
        this.recentActivity = appointments.slice(0, 5).map((appt: any) => ({
          type: 'appointment',
          message: `Cita: ${appt.Service?.VcName || 'Servicio'} - ${appt.Professional?.VcFirstName || 'Profesional'}`,
          time: appt.DtDate ? new Date(appt.DtDate).toLocaleDateString('es-CO') : '',
          user: appt.Client?.VcFirstName
            ? `${appt.Client.VcFirstName} ${appt.Client.VcFirstLastName || ''}`
            : 'Cliente'
        }));
      },
      error: () => {
        this.stats[1].value = '0';
      }
    });
  }

  refreshData(): void {
    this.loadStats();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
