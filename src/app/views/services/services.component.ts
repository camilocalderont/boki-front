import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../services/service.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { Service } from '../../shared/interfaces/service.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-services',
  imports: [
    CommonModule,
    DataGridComponent,
    ThemeComponentsModule,
  ],
  templateUrl: './services.component.html',
})
export class ServicesComponent extends BaseComponent {
  services: Service[] = [];

  serviceColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'IRegularPrice', label: 'Precio' },
    { key: 'VcTime', label: 'Duración' },
    { key: 'Category.VcName', label: 'Categoría' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private serviceService: ServiceService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (response: ApiSuccessResponse<Service[]>) => {
        this.services = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading services:', error);
      },
    });
  }

  createService(): void {
    this.router.navigate(['/dashboard/services/create']);
  }

  updateService(id: number): void {
    this.router.navigate(['/dashboard/services/update', id]);
  }
}
