import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../shared/interfaces/appointment.interface';
import { ApiSuccessResponse, CustomError } from '../../shared/interfaces/api.interface';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ThemeComponentsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent extends BaseComponent {
  appointments: any[] = [];

  columns: DataGridColumn[] = [
    { key: 'Client.VcFirstName', label: 'Cliente' },
    { key: 'Service.VcName', label: 'Servicio' },
    { key: 'Professional.VcFirstName', label: 'Profesional' },
    { key: 'DtDate', label: 'Fecha', format: FORMAT_DATA.DATE },
    { key: 'TStartTime', label: 'Hora' },
    { key: 'CurrentState.VcName', label: 'Estado' },
  ];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: (response: ApiSuccessResponse<Appointment[]>) => {
        this.appointments = response.data || [];
      },
      error: (error: CustomError) => {
        console.error('Error cargando citas:', error);
        this.appointments = [];
      },
    });
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }

  updateAppointment(id: number): void {
    console.log('Editar cita:', id);
  }
}
