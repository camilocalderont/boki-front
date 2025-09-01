import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GetFaqsResponse, PostFaqsRequest } from '../../../shared/interfaces/faqs.interface';
import { CommonModule } from '@angular/common';
import { GetCompanyResponse } from '../../../shared/interfaces/company.interface';
import { GetCategoryResponse } from '../../../shared/interfaces/category.interface';
import { FaqsService } from '../../../services/faqs.service';
import { CompanyService } from '../../../services/company.service';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeConfigService } from '../../../services/theme-config.service';

@Component({
  selector: 'form-faqs',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-faqs.component.html',
  styleUrls: ['./form-faqs.component.scss']
})
export class FormFaqsComponent {

  form!: FormGroup;
  isEditMode = false;
  faqsId: string | null = null;
  theme: any = null;

  companies: GetCompanyResponse[] = [];
  categories: GetCategoryResponse[] = [];

  constructor(
    private faqsService: FaqsService,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private themeConfigService: ThemeConfigService
  ) {}

  ngOnInit(): void {
    this.theme = this.themeConfigService.getCurrentTheme();
    this.faqsId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.faqsId;
    
    this.initializeForm();
    
    if (this.isEditMode) {
      this.loadFaqs();
    }

    this.loadCompanies();
    this.loadCategories();
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
        const faqs = response.data;
        this.form.patchValue(faqs);
      },
      error: (error) => {
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
        console.error('Error al cargar las categorías:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: PostFaqsRequest = this.form.value;

    if (this.isEditMode) {
      console.log('Actualizar FAQ:', payload);
      this.faqsService.updateFaqs(Number(this.faqsId), payload).subscribe({
        next: (response) => {
          console.log('FAQ actualizado:', response);
          this.router.navigate(['/dashboard/faqs']);
        },
        error: (error) => {
          console.error('Error al actualizar FAQ:', error);
        }
      });
    } else {
      console.log('Crear FAQ:', payload);
      this.faqsService.createFaqs(payload).subscribe({
        next: (response) => {
          console.log('FAQ creado:', response);
          this.router.navigate(['/dashboard/faqs']);
        },
        error: (error) => {
          console.error('Error al crear FAQ:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }
}
