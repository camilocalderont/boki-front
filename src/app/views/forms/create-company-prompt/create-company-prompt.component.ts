import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { PostCompanyPrompt } from '../../../shared/interfaces/companny-prompt.interface';
import { GetCompanyResponse, GetUserResponse } from '../../../shared/interfaces/company.interface';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { SnackBarService } from '../../../shared/components/snack-bar/service/snack-bar.service';
 

@Component({
  selector: 'create-company-prompt',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ThemeComponentsModule
  ],
  templateUrl: './create-company-prompt.component.html',
  styleUrl: './create-company-prompt.component.scss'
})
export class CreateCompanyPromptComponent extends BaseComponent {

  form!: FormGroup;
  isEditMode = false;
  companyPromptId: string | null = null;
  companies: GetCompanyResponse[] = [];
  users: GetUserResponse[] = [];
  @Input() companyId: number | null = null;
  @Input() editCompanyPromptId: number | null = null; // Para modo edición en modal
  @Output() onClose = new EventEmitter<boolean>();
  isModalMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private snackBarService: SnackBarService
  ) {
    super();
  }

  override ngOnInit(): void {
    this.loadCompanies();
    this.loadUsers();
    super.ngOnInit();
  }

  protected onComponentInit(): void {
    // Verificar si se está ejecutando como modal: si viene companyId por @Input
    this.isModalMode = this.companyId !== null && this.companyId !== undefined;

    if (!this.isModalMode) {
      // Modo página: obtener ID de la ruta
      this.companyPromptId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.companyPromptId;
    } else {
      // Modo modal: verificar si viene editCompanyPromptId para edición
      this.isEditMode = this.editCompanyPromptId !== null && this.editCompanyPromptId !== undefined;
      if (this.isEditMode) {
        this.companyPromptId = this.editCompanyPromptId!.toString();
      }
    }

    this.form = this.fb.group({
      CompanyId: [this.companyId || '', Validators.required],
      VcDescription: ['', [Validators.required, Validators.maxLength(500)]],
      VcInternalCode: ['', [Validators.required, Validators.maxLength(100)]],
      TxIntentionPrompt: ['', [Validators.required, Validators.maxLength(2000)]],
      TxMainPrompt: ['', [Validators.required, Validators.maxLength(5000)]],
      UserId: ['', Validators.required],
    });

    if (this.isEditMode) {
      this.loadCompanyPrompt(this.companyPromptId!);
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

  loadUsers(): void {
    this.companyService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar los usuarios:', {"type": "error"});
        console.error('Error al cargar los usuarios:', error);
      }
    });
  }

  loadCompanyPrompt(id: string): void {
    this.companyService.getCompanyPromptById(Number(id)).subscribe({
      next: (response) => {
        if (response.data !== null) {
          const companyPrompt = response.data;
          this.form.patchValue(companyPrompt);
        } else {
          this.snackBarService.open('Prompt de empresa no encontrado', {"type": "error", "position": "bot-right"});
          this.router.navigate(['/dashboard/company-prompts']);
        }
      },
      error: (error) => {
        this.snackBarService.open('Error al cargar el prompt de empresa:', {"type": "error", "position": "bot-right"});
        console.error('Error al cargar el prompt de empresa:', error);
      }
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: PostCompanyPrompt = this.form.value;

    if (this.isEditMode) {
      this.companyService.putCompanyPromptById(Number(this.companyPromptId), payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Prompt de empresa actualizado', {"type": "success", "position": "bot-right"});
            if (this.isModalMode) {
              this.onClose.emit(true);
            } else {
              this.router.navigate(['/dashboard/company-prompts']);
            }
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al actualizar prompt de empresa:', {"type": "error", "position": "bot-right"});
          console.error('Error al actualizar prompt de empresa:', error);
        }
      });
    } else {
      this.companyService.postCompanyPrompt(payload).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Prompt de empresa creado', {"type": "success", "position": "bot-right"});
            if (this.isModalMode) {
              this.onClose.emit(true);
            } else {
              this.router.navigate(['/dashboard/company-prompts']);
            }
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al crear prompt de empresa:', {"type": "error", "position": "bot-right"});
          console.error('Error al crear prompt de empresa:', error);
        }
      });
    }
  }

  redirectLink(link: string) {
    this.router.navigate([link]);
  }

  closeModal(): void {
    if (this.isModalMode) {
      this.onClose.emit(false);
    }
  }
}
