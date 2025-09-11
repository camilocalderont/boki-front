import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { PostCategoryRequest } from '../../../shared/interfaces/category.interface';
import { CompanyService } from '../../../services/company.service';
import { GetCompanyResponse } from '../../../shared/interfaces/company.interface';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { SnackBarService } from '../../../shared/components/snack-bar/service/snack-bar.service';

@Component({
  selector: 'create-category',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ThemeComponentsModule
  ],
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent extends BaseComponent {

  form!: FormGroup;
  isEditMode = false;
  categoryId: string | null = null;
  companies: GetCompanyResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private companyService: CompanyService,
    private snackBarService: SnackBarService
  ) {
    super(); // 👈 Llamar al constructor padre
  }

  override ngOnInit(): void {
    this.loadCompanies();
    super.ngOnInit(); // 👈 Llamar al método ngOnInit del padre
  }

  protected onComponentInit(): void {
    // Este método se ejecuta después de que el tema esté disponible
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.categoryId;

    this.form = this.fb.group({
      VcName: ['', [Validators.required, Validators.maxLength(300)]],
      CompanyId: ['', Validators.required],
      BIsService: [true, Validators.required],
    });

    if (this.isEditMode) {
      this.loadCategory(this.categoryId!);
    }
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies = response.data;
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar las empresas:', {"type": "error"});
        console.error('Error al cargar las empresas:', error);
      }
    });
  }

  loadCategory(id: string): void {
    this.categoryService.getCategoryById(Number(id)).subscribe({
      next: (response) => {
        if (response.data !== null) {
          const category = response.data;
          this.form.patchValue(category);
        } else {
          this.snackBarService.open('Categoría no encontrada', {"type": "error", "position": "bot-right"});
          this.router.navigate(['/dashboard/categories']);
        }
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar la categoría:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar la categoría:', error);
      }
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: PostCategoryRequest = this.form.value;

    if (this.isEditMode) {
      this.categoryService.putCategoryById(Number(this.categoryId), payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Categoría actualizada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/categories']);
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al actualizar categoría:', {"type": "error", "position": "bot-right"});
          console.error('Error al actualizar categoría:', error);
        }
      });
    } else {
      this.categoryService.postCategory(payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Categoría creada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/categories']);
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al crear categoría:', {"type": "error", "position": "bot-right"});
          console.error('Error al crear categoría:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }
}