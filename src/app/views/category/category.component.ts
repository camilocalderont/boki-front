import { Component } from '@angular/core';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { GetCategoryResponse } from '../../shared/interfaces/category.interface';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ApiSuccessResponse, CustomError } from '../../shared/interfaces/api.interface';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-category',
  imports: [
    DataGridComponent,
    ThemeComponentsModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent extends BaseComponent {

  categories: GetCategoryResponse[] = [];

  columns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'Company.VcName', label: 'Empresa' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) {
    super(); 
  }

  protected onComponentInit(): void {
    // Este método se ejecuta después de que el tema esté disponible
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiSuccessResponse<GetCategoryResponse[]>) => {
        this.categories = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  createCategory() {
    this.router.navigate(['/dashboard/categories/create']);
  }

  updateCategory(id: number) {
    this.router.navigate(['/dashboard/categories/update', id]);
  }
}