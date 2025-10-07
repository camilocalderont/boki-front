import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanService } from '../../../services/plan.service';
import { GetCompanyPlanControlTokenRs, PostCompanyPlanControlTokenRq } from '../../../shared/interfaces/company-plan-control-token.interface';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../../shared/components/theme-components';
import { SnackBarService } from '../../../shared/components/snack-bar/service/snack-bar.service';
import { ApiSuccessResponse } from '../../../shared/interfaces/api.interface';
import { GetCompanyPlansRs } from '../../../shared/interfaces/company-plan.interface';

@Component({
  selector: 'create-company-plan-control-token',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ThemeComponentsModule
  ],
  templateUrl: './create-company-plan-control-token.component.html',
  styleUrl: './create-company-plan-control-token.component.scss'
})
export class CreateCompanyPlanControlTokenComponent extends BaseComponent {
  form!: FormGroup;
  isEditMode = false;
  companyPlanControlTokenId: number | null = null;
  companyPlanId: number = 0;
  @Input() companyId: number | null = null;
  @Output() onClose = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private snackBarService: SnackBarService
  ) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected override onComponentInit(): void {
    this.initForm();
    if (this.companyId) {
      this.loadExistingControlToken();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      CompanyPlanId: [this.companyPlanId],
      IYear: [null, [Validators.required]],
      IMonth: [null, [Validators.required]],
      IMaxInteractionTokens: [null, [Validators.required]],
      IMaxConversationTokens: [null, [Validators.required]]
    });
  }

  private loadExistingControlToken(): void {
    if (!this.companyId) return;

    // Buscar si existe un registro para el companyPlanId actual
    this.planService.getCompanyPlanByCompanyId(this.companyId).subscribe({
      next: (response: ApiSuccessResponse<GetCompanyPlansRs>) => {
        try {
          if (response && response.status === "success" && response.data && Array.isArray(response.data.CompanyPlanControlTokens)) {
            this.companyPlanId = response.data.Id;
            const existingToken = response.data.CompanyPlanControlTokens.find((token: GetCompanyPlanControlTokenRs) =>
              token.CompanyPlanId === this.companyPlanId);
            if (existingToken) {
              // Si existe, cargar los datos en el formulario y activar modo edición
              this.isEditMode = true;
              this.companyPlanControlTokenId = existingToken.Id;
              this.form.patchValue(existingToken);
            }
          }
        } catch (err) {
        }
      },
      error: (error: any) => {
        this.snackBarService.open('Error al verificar token existente', {"type": "error", "position": "bot-right"});
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.patchValue({ CompanyPlanId: this.companyPlanId });
    const payload: PostCompanyPlanControlTokenRq = this.form.value;

    if (this.isEditMode && this.companyPlanControlTokenId) {
      // Actualizar
      this.planService.putCompanyPlanControlToken(payload, this.companyPlanControlTokenId).subscribe({
        next: (response: ApiSuccessResponse<GetCompanyPlanControlTokenRs>) => {
          if (response.status === "success") {
            this.snackBarService.open('Token actualizado correctamente', { "type": "success", "position": "bot-right" });
            this.handleSuccess();
          }
        },
        error: (error: any) => {
          this.snackBarService.open('Error al actualizar el token', { "type": "error", "position": "bot-right" });
        }
      });
    } else {
      // Crear
      this.planService.postCompanyPlanControlToken(payload).subscribe({
        next: (response: ApiSuccessResponse<GetCompanyPlanControlTokenRs>) => {
          if (response.status === "success") {
            this.snackBarService.open('Token creado correctamente', { "type": "success", "position": "bot-right" });
            this.handleSuccess();
          }
        },
        error: (error: any) => {
          this.snackBarService.open('Error al crear el token', { "type": "error", "position": "bot-right" });
        }
      });
    }
  }

  private handleSuccess(): void {
    this.closeModal(true);
  }

  closeModal(success: boolean = false): void {
    this.onClose.emit(success);
  }
}
