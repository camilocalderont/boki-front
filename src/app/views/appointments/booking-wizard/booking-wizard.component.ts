import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { AppointmentService } from '../../../services/appointment.service';
import { ProfessionalService } from '../../../services/professional.service';
import { ServiceService } from '../../../services/service.service';
import { ClientService } from '../../../services/client.service';
import { Service } from '../../../shared/interfaces/service.interface';
import { Professional } from '../../../shared/interfaces/professional.interface';
import { Client, CreateClientRequest } from '../../../shared/interfaces/client.interface';
import { AvailableSlots, CreateAppointmentRequest } from '../../../shared/interfaces/appointment.interface';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeComponentsModule],
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.scss'],
})
export class BookingWizardComponent extends BaseComponent {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private professionalService = inject(ProfessionalService);
  private serviceService = inject(ServiceService);
  private clientService = inject(ClientService);

  currentStep = signal<1 | 2 | 3>(1);
  selectedService = signal<Service | null>(null);
  selectedProfessional = signal<Professional | null>(null);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  selectedClient = signal<Client | null>(null);

  services: Service[] = [];
  professionals: Professional[] = [];
  availableSlots: AvailableSlots = { manana: [], tarde: [], noche: [] };
  calendarDates: { date: string; label: string; dayName: string; month: string }[] = [];

  // Client search
  clientSearchQuery = '';
  clientSearchResults: Client[] = [];
  showNewClientForm = false;
  newClient: CreateClientRequest = {
    CompanyId: 1,
    VcIdentificationNumber: '',
    VcPhone: '',
    VcFirstName: '',
    VcFirstLastName: '',
  };

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  protected onComponentInit(): void {
    this.loadServices();
    this.generateCalendarDates();
  }

  // --- Step 1: Services ---

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (res) => (this.services = res.data || []),
      error: () => (this.services = []),
    });
  }

  selectService(service: Service): void {
    this.selectedService.set(service);
  }

  goToStep2(): void {
    if (!this.selectedService()) return;
    this.currentStep.set(2);
    this.loadProfessionals();
  }

  // --- Step 2: Professional + Date + Time ---

  private loadProfessionals(): void {
    const serviceId = this.selectedService()?.Id;
    if (!serviceId) return;

    this.professionalService.getByService(serviceId).subscribe({
      next: (res) => (this.professionals = res.data || []),
      error: () => (this.professionals = []),
    });
  }

  selectProfessional(professional: Professional): void {
    this.selectedProfessional.set(professional);
    this.selectedTime.set(null);
    this.availableSlots = { manana: [], tarde: [], noche: [] };
    if (this.selectedDate()) {
      this.loadAvailableSlots();
    }
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.availableSlots = { manana: [], tarde: [], noche: [] };
    if (this.selectedProfessional()) {
      this.loadAvailableSlots();
    }
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  private loadAvailableSlots(): void {
    const profId = this.selectedProfessional()?.Id;
    const serviceId = this.selectedService()?.Id;
    const date = this.selectedDate();
    if (!profId || !serviceId || !date) return;

    this.isLoading = true;
    this.appointmentService.getAvailableSlots(profId, serviceId, date).subscribe({
      next: (res) => {
        this.availableSlots = res.data || { manana: [], tarde: [], noche: [] };
        this.isLoading = false;
      },
      error: () => {
        this.availableSlots = { manana: [], tarde: [], noche: [] };
        this.isLoading = false;
      },
    });
  }

  private generateCalendarDates(): void {
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.calendarDates = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      this.calendarDates.push({
        date: `${yyyy}-${mm}-${dd}`,
        label: String(d.getDate()),
        dayName: dayNames[d.getDay()],
        month: monthNames[d.getMonth()],
      });
    }
  }

  goToStep3(): void {
    if (!this.selectedProfessional() || !this.selectedDate() || !this.selectedTime()) return;
    this.currentStep.set(3);
  }

  // --- Step 3: Client + Confirm ---

  searchClients(): void {
    if (this.clientSearchQuery.length < 2) {
      this.clientSearchResults = [];
      return;
    }
    this.clientService.search(this.clientSearchQuery, this.newClient.CompanyId).subscribe({
      next: (res) => (this.clientSearchResults = res.data || []),
      error: () => (this.clientSearchResults = []),
    });
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.clientSearchResults = [];
    this.showNewClientForm = false;
  }

  toggleNewClientForm(): void {
    this.showNewClientForm = !this.showNewClientForm;
    this.selectedClient.set(null);
  }

  createAndSelectClient(): void {
    if (!this.newClient.VcFirstName || !this.newClient.VcFirstLastName || !this.newClient.VcPhone) return;

    this.clientService.create(this.newClient).subscribe({
      next: (res) => {
        this.selectedClient.set(res.data);
        this.showNewClientForm = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al crear cliente';
      },
    });
  }

  confirmAppointment(): void {
    const service = this.selectedService();
    const professional = this.selectedProfessional();
    const date = this.selectedDate();
    const time = this.selectedTime();
    const client = this.selectedClient();

    if (!service || !professional || !date || !time || !client) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: CreateAppointmentRequest = {
      ClientId: client.Id,
      ServiceId: service.Id,
      ProfessionalId: professional.Id,
      DtDate: date,
      TStartTime: time,
      CurrentStateId: 1,
    };

    this.appointmentService.create(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/appointments']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Error al crear la cita';
      },
    });
  }

  // --- Navigation ---

  goBack(): void {
    const step = this.currentStep();
    if (step === 2) this.currentStep.set(1);
    else if (step === 3) this.currentStep.set(2);
    else this.router.navigate(['/dashboard/appointments']);
  }

  get hasSlots(): boolean {
    return (
      this.availableSlots.manana.length > 0 ||
      this.availableSlots.tarde.length > 0 ||
      this.availableSlots.noche.length > 0
    );
  }
}
