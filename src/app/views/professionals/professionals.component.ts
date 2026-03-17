import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalService } from '../../services/professional.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { Professional } from '../../shared/interfaces/professional.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-professionals',
  imports: [
    CommonModule,
    DataGridComponent,
    ThemeComponentsModule,
  ],
  templateUrl: './professionals.component.html',
})
export class ProfessionalsComponent extends BaseComponent {
  professionals: Professional[] = [];

  professionalColumns: DataGridColumn[] = [
    { key: 'VcFirstName', label: 'Nombre' },
    { key: 'VcFirstLastName', label: 'Apellido' },
    { key: 'VcEmail', label: 'Correo Electrónico' },
    { key: 'VcPhone', label: 'Teléfono' },
    { key: 'VcProfession', label: 'Profesión' },
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

  private loadProfessionals(): void {
    this.professionalService.getAll().subscribe({
      next: (response: ApiSuccessResponse<Professional[]>) => {
        this.professionals = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading professionals:', error);
      },
    });
  }

  createProfessional(): void {
    this.router.navigate(['/dashboard/professionals/create']);
  }

  updateProfessional(id: number): void {
    this.router.navigate(['/dashboard/professionals/update', id]);
  }
}
