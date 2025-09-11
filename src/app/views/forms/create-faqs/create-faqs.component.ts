import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostFaqsRequest } from '../../../shared/interfaces/faqs.interface';
import { CommonModule } from '@angular/common';
import { GetCompanyResponse } from '../../../shared/interfaces/company.interface';
import { GetCategoryResponse } from '../../../shared/interfaces/category.interface';
import { FaqsService } from '../../../services/faqs.service';
import { CompanyService } from '../../../services/company.service';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { SnackBarService } from '../../../shared/components/snack-bar/service/snack-bar.service';

@Component({
  selector: 'create-faqs',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ThemeComponentsModule
  ],
  templateUrl: './create-faqs.component.html',
  styleUrls: ['./create-faqs.component.scss']
})
export class CreateFaqsComponent extends BaseComponent {

  form!: FormGroup;
  isEditMode = false;
  faqsId: string | null = null;

  companies: GetCompanyResponse[] = [];
  categories: GetCategoryResponse[] = [];

  constructor(
    private faqsService: FaqsService,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBarService: SnackBarService
  ) {
    super(); 
  }

  override ngOnInit(): void {
    this.loadCompanies();
    this.loadCategories();
    super.ngOnInit();
  }

  protected onComponentInit(): void {
    // Este método se ejecuta después de que el tema esté disponible
    this.faqsId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.faqsId;
    
    this.initializeForm();
    
    if (this.isEditMode) {
      this.loadFaqs();
    }
  }

  private initializeForm(): void {
    this.form = new FormGroup({
      VcQuestion: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      VcAnswer: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      CompanyId: new FormControl('', Validators.required),
      CategoryServiceId: new FormControl('', Validators.required),
    });
  }

  loadFaqs(): void {
    this.faqsService.getFaqsById(Number(this.faqsId)).subscribe({
      next: (response) => {
        if (response.data !== null) {
          const faqs = response.data;
          this.form.patchValue(faqs);
        } else {
          this.snackBarService.open('FAQS no encontrada', {"type": "error", "position": "bot-right"});
          this.router.navigate(['/dashboard/faqs']);
        }
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar las preguntas frecuentes:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar las preguntas frecuentes:', error);
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies = response.data;
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar las empresas:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar las empresas:', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar las categorías:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar las categorías:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: PostFaqsRequest = this.form.value;

    if (this.isEditMode) {
      this.faqsService.updateFaqs(Number(this.faqsId), payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('FAQS actualizada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/faqs']);
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al actualizar FAQS:', {"type": "error", "position": "bot-right"});
          console.error('Error al actualizar FAQS:', error);
        }
      });
    } else {
      this.faqsService.createFaqs(payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('FAQS creada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/faqs']);
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al crear FAQS:', {"type": "error", "position": "bot-right"});
          console.error('Error al crear FAQS:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }
}