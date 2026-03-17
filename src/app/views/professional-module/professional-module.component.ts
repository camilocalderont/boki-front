import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { TabsComponent, Tab } from '../../shared/components/tabs/tabs.component';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-professional-module',
  standalone: true,
  imports: [CommonModule, ThemeComponentsModule, DataGridComponent, TabsComponent],
  templateUrl: './professional-module.component.html',
})
export class ProfessionalModuleComponent extends BaseComponent {
  activeTab = 'professionals';
  tabs: Tab[] = [
    { id: 'professionals', label: 'Profesionales' },
    { id: 'schedules', label: 'Horarios' },
    { id: 'prof-services', label: 'Servicios Asociados' },
  ];

  professionals: any[] = [];
  selectedProfessional: any = null;

  professionalColumns: DataGridColumn[] = [
    { key: 'VcFirstName', label: 'Nombre' },
    { key: 'VcFirstLastName', label: 'Apellido' },
    { key: 'VcEmail', label: 'Correo Electronico' },
    { key: 'VcPhone', label: 'Telefono' },
    { key: 'VcProfession', label: 'Profesion' },
    { key: 'VcSpecialization', label: 'Especialidad' },
  ];

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadProfessionals();
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  private loadProfessionals(): void {
    this.professionalService.getAll().subscribe({
      next: (res: any) => { this.professionals = res.data || []; },
      error: () => { this.professionals = []; }
    });
  }

  createProfessional(): void { this.router.navigate(['/dashboard/professionals/create']); }
  editProfessional(id: number): void { this.router.navigate(['/dashboard/professionals/edit', id]); }

  selectProfessional(prof: any): void {
    this.selectedProfessional = prof;
  }
}
