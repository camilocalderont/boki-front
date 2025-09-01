import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCompanyRequest } from '../../../shared/interfaces/company.interface';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeConfigService } from '../../../services/theme-config.service';

@Component({
  selector: 'form-company',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-company.component.html',
  styleUrl: './form-company.component.scss'
})
export class FormCompanyComponent {

  form!: FormGroup;
  isEditMode = false;
  companyId: string | null = null;
  theme: any = null;

  userIdLogged: number | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private userData: AuthService,
    private themeConfigService: ThemeConfigService
  ) {}

  ngOnInit(): void {
    this.theme = this.themeConfigService.getCurrentTheme();
    this.companyId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.companyId;

    this.initializeForm();

    if (this.isEditMode) {
      this.loadCompany(this.companyId!);
    }

    this.userIdLogged = this.userData.getCurrentUser()?.Id;
  }

  initializeForm(): void {
    this.form = this.fb.group({
      VcName: ['', [Validators.required, Validators.maxLength(150)]],
      VcDescription: ['', Validators.maxLength(1000)],
      VcPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      VcPrincipalAddress: ['', Validators.required],
      VcPrincipalEmail: ['', [Validators.required, Validators.email]],
      VcLegalRepresentative: ['', Validators.required],
      UserId: [''],
      TxPrompt: ['', Validators.maxLength(10000)],
    });
  }

  loadCompany(id: string): void {
    this.companyService.getCompanyById(Number(id)).subscribe({
      next: (response) => {
        const company = response.data;
        this.form.patchValue(company);
      },
      error: (error) => {
        console.error('Error al cargar la empresa:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.form.controls['UserId'].setValue(this.userIdLogged);
    const payload: PostCompanyRequest = this.form.value;

    if (this.isEditMode) {
      console.log('Actualizar empresa:', payload);
      this.companyService.putCompanyById(Number(this.companyId), payload).subscribe({
        next: (response) => {
          console.log('Empresa actualizada:', response);
          this.router.navigate(['/dashboard/companies']);
        },
        error: (error) => {
          console.error('Error al actualizar empresa:', error);
        }
      });
    } else {
      console.log('Crear empresa:', payload);
      this.companyService.postCompany(payload).subscribe({
        next: (response) => {
          console.log('Empresa creada:', response);
          this.router.navigate(['/dashboard/companies']);
        },
        error: (error) => {
          console.error('Error al crear empresa:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }
}
