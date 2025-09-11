import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCompanyRequest } from '../../../shared/interfaces/company.interface';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { SnackBarService } from '../../../shared/components/snack-bar/service/snack-bar.service';

@Component({
  selector: 'create-company',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ThemeComponentsModule
  ],
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss']
})
export class CreateCompanyComponent extends BaseComponent {

  form!: FormGroup;
  isEditMode = false;
  companyId: string | null = null;
  userIdLogged: number | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private userData: AuthService,
    private snackBarService: SnackBarService
  ) {
    super(); // 👈 Llamar al constructor padre
  }

  protected onComponentInit(): void {
    // Este método se ejecuta después de que el tema esté disponible
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
        if (response.data !== null) {
          const company = response.data;
          this.form.patchValue(company);
        } else {
          this.snackBarService.open('Empresa no encontrada', {"type": "error", "position": "bot-right"});
          this.router.navigate(['/dashboard/companies']);
        }
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar la empresa:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar la empresa:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.form.controls['UserId'].setValue(this.userIdLogged);
    const payload: PostCompanyRequest = this.form.value;

    if (this.isEditMode) {
      this.companyService.putCompanyById(Number(this.companyId), payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Empresa actualizada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/companies']);
          } else {
            this.snackBarService.open('Error al actualizar empresa', {"type": "error", "position": "bot-right"});
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al actualizar empresa', {"type": "error", "position": "bot-right"});
          console.error('Error al actualizar empresa:', error);
        }
      });
    } else {
      this.companyService.postCompany(payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Empresa creada', {"type": "success", "position": "bot-right"});
            this.router.navigate(['/dashboard/companies']);
          } else {
            this.snackBarService.open('Error al crear empresa', {"type": "error", "position": "bot-right"});
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al crear empresa', {"type": "error", "position": "bot-right"});
          console.error('Error al crear empresa:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }
}