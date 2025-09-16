import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { GetAllPlansRs, PlanFeatures } from '../../shared/interfaces/plan.interface';
import { GetCompanyPlansRs, PostCompanyPlanRq } from '../../shared/interfaces/company-plan.interface';
import { SnackBarService } from '../../shared/components/snack-bar/service/snack-bar.service';
import { ThemeComponentsModule } from '../../shared/components/theme-components/theme-components.module';


@Component({
  selector: 'plans-component',
  imports: [CommonModule, ThemeComponentsModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss'
})
export class PlansComponent implements OnInit {

  plans: GetAllPlansRs[] = [];
  selectedPlanId: number | null = null;
  companyId: number | null = null;
  companyPlanId: number | null = null; // ID del registro company-plan existente
  isLoading = false;

  constructor(
    private planService: PlanService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.companyId = params['companyId'] ? +params['companyId'] : null;
      this.loadPlans();
      if (this.companyId) {
        this.loadCompanyPlan();
      }
    });
  }

  loadPlans(): void {
    this.isLoading = true;
    this.planService.getAllPlans().subscribe({
      next: (response) => {
        this.plans = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.snackBarService.open('Error al cargar los planes', {"type": "error", "position": "bot-right"});
        this.isLoading = false;
      }
    });
  }

  loadCompanyPlan(): void {
    if (!this.companyId) return;

    this.planService.getCompanyPlanByCompanyId(this.companyId).subscribe({
      next: (response) => {
        if (response.data) {
          this.selectedPlanId = response.data.PlanId;
          this.companyPlanId = response.data.Id;
        } else {
          this.selectedPlanId = null;
          this.companyPlanId = null;
        }
      },
      error: (error) => {
        // Si no hay plan asociado, ambos permanecen null
        this.selectedPlanId = null;
        this.companyPlanId = null;
      }
    });
  }

  selectPlan(planId: number): void {
    if (!this.companyId) {
      this.snackBarService.open('ID de compañía no válido', {"type": "error", "position": "bot-right"});
      return;
    }

    const data: PostCompanyPlanRq = {
      CompanyId: this.companyId,
      PlanId: planId
    };

    this.isLoading = true;

    // Si ya existe un registro (companyPlanId no es null), actualizar; si no, crear nuevo
    const serviceCall = this.companyPlanId
      ? this.planService.putCompanyPlan(this.companyPlanId, data)
      : this.planService.postCompanyPlan(data);

    serviceCall.subscribe({
      next: (response) => {
        this.selectedPlanId = planId;
        // Si era una creación nueva, almacenar el ID del nuevo registro
        if (!this.companyPlanId && response.data) {
          this.companyPlanId = response.data.Id;
        }

        const actionText = this.companyPlanId ? 'actualizado' : 'seleccionado';
        this.snackBarService.open(`Plan ${actionText} correctamente`, {"type": "success", "position": "bot-right"});
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error selecting/updating plan:', error);
        const actionText = this.companyPlanId ? 'actualizar' : 'seleccionar';
        this.snackBarService.open(`Error al ${actionText} el plan`, {"type": "error", "position": "bot-right"});
        this.isLoading = false;
      }
    });
  }

  confirmPlanSelection(plan: GetAllPlansRs): void {
    // Si es el plan actual, no hacer nada
    if (this.selectedPlanId === plan.Id) {
      return;
    }

    const isFirstSelection = this.selectedPlanId === null;
    const actionText = isFirstSelection ? 'seleccionar' : 'cambiar a';
    const currentPlanText = isFirstSelection ? '' : ' actual';

    const confirmMessage = `¿Estás seguro de que deseas ${actionText} este plan${currentPlanText}?\n\n` +
      `Plan: ${this.formatPrice(plan.IValueMonthly)}/mes\n` +
      `Conversaciones: ${plan.IMaxConversation.toLocaleString()}\n` +
      `Precio anual: ${this.formatPrice(plan.IValueYearly)}`;

    if (confirm(confirmMessage)) {
      this.selectPlan(plan.Id);
    }
  }

  parsePlanProperties(properties: string): PlanFeatures {
    try {
      return JSON.parse(properties);
    } catch (error) {
      console.error('Error parsing plan properties:', error);
      return { features: [], limits: { users: 0, storage: '0GB' } };
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  goBack(): void {
    if (this.companyId) {
      this.router.navigate(['/dashboard/companies/update', this.companyId]);
    } else {
      this.router.navigate(['/dashboard/companies']);
    }
  }
}
