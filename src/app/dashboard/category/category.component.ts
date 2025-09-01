import { Component } from '@angular/core';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { GetCategoryResponse } from '../../shared/interfaces/category.interface';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ApiSuccessResponse, CustomError } from '../../shared/interfaces/api.interface';
import { ThemeConfigService } from '../../services/theme-config.service';

@Component({
  selector: 'app-category.component',
  imports: [DataGridComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {

  categories: GetCategoryResponse[] = [];
  theme: any = null;

  columns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'CompanyId', label: 'Empresa' },
    // { key: 'BIsService', label: 'Esta en Servicio' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(private router: Router,
    private categoryService: CategoryService,
    private themeConfigService: ThemeConfigService
  ) { }

  ngOnInit() {
    this.theme = this.themeConfigService.getCurrentTheme();
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
