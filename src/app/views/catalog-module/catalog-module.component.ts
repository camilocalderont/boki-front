import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { TabsComponent, Tab } from '../../shared/components/tabs/tabs.component';
import { CategoryService } from '../../services/category.service';
import { ServiceService } from '../../services/service.service';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';

@Component({
  selector: 'app-catalog-module',
  standalone: true,
  imports: [CommonModule, ThemeComponentsModule, DataGridComponent, TabsComponent],
  templateUrl: './catalog-module.component.html',
})
export class CatalogModuleComponent extends BaseComponent {
  activeTab = 'categories';
  tabs: Tab[] = [
    { id: 'categories', label: 'Categorias' },
    { id: 'services', label: 'Servicios' },
  ];

  categories: any[] = [];
  services: any[] = [];

  categoryColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'Company.VcName', label: 'Empresa' },
    { key: 'created_at', label: 'Fecha de Creacion', format: FORMAT_DATA.DATE },
  ];

  serviceColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcDescription', label: 'Descripcion' },
    { key: 'IRegularPrice', label: 'Precio' },
    { key: 'VcTime', label: 'Duracion' },
    { key: 'Category.VcName', label: 'Categoria' },
    { key: 'created_at', label: 'Fecha de Creacion', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private categoryService: CategoryService,
    private serviceService: ServiceService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadCategories();
    this.loadServices();
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data || []; },
      error: () => { this.categories = []; }
    });
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (res: any) => { this.services = res.data || []; },
      error: () => { this.services = []; }
    });
  }

  createCategory(): void { this.router.navigate(['/dashboard/catalog/categories/create']); }
  editCategory(id: number): void { this.router.navigate(['/dashboard/catalog/categories/edit', id]); }
  createService(): void { this.router.navigate(['/dashboard/catalog/services/create']); }
  editService(id: number): void { this.router.navigate(['/dashboard/catalog/services/edit', id]); }
}
