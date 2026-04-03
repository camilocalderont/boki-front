import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { BkButtonComponent } from '@shared/ui';
import type { Plan, OnboardingStep4Request } from '../model/onboarding.model';

interface ParsedPlanProperties {
  maxProfessionals?: number | string;
  maxServices?: number | string;
  maxBranches?: number | string;
  [key: string]: unknown;
}

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'bk-onboarding-step4',
  standalone: true,
  imports: [BkButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-ob-step4">
      @if (error()) {
        <div class="bk-ob-step4__error" role="alert">
          <span>{{ error() }}</span>
        </div>
      }

      <button type="button" class="bk-ob-step4__back" (click)="back.emit()">
        ← Volver al paso anterior
      </button>

      <div class="bk-ob-step4__billing-toggle">
        <button
          type="button"
          class="bk-ob-step4__toggle-btn"
          [class.bk-ob-step4__toggle-btn--active]="billingCycle() === 'monthly'"
          (click)="billingCycle.set('monthly')"
        >
          Mensual
        </button>
        <button
          type="button"
          class="bk-ob-step4__toggle-btn"
          [class.bk-ob-step4__toggle-btn--active]="billingCycle() === 'yearly'"
          (click)="billingCycle.set('yearly')"
        >
          Anual <span class="bk-ob-step4__discount-badge">20% dto.</span>
        </button>
      </div>

      <div class="bk-ob-step4__plans">
        @for (plan of plans(); track plan.Id) {
          <div
            class="bk-ob-step4__plan-card"
            [class.bk-ob-step4__plan-card--selected]="selectedPlanId() === plan.Id"
            [class.bk-ob-step4__plan-card--recommended]="plan.VcSlug === 'professional'"
            (click)="selectPlan(plan.Id)"
          >
            @if (plan.VcSlug === 'professional') {
              <div class="bk-ob-step4__recommended-badge">Recomendado</div>
            }

            <div class="bk-ob-step4__plan-header">
              <h3 class="bk-ob-step4__plan-name">{{ plan.VcName }}</h3>
              <div class="bk-ob-step4__plan-price">
                <span class="bk-ob-step4__price-amount">{{ formatPrice(plan) }}</span>
                <span class="bk-ob-step4__price-period">/ {{ billingCycle() === 'monthly' ? 'mes' : 'año' }}</span>
              </div>
            </div>

            <p class="bk-ob-step4__plan-desc">{{ plan.VcDescription }}</p>

            <ul class="bk-ob-step4__features">
              @for (feature of parsePlanFeatures(plan); track feature) {
                <li class="bk-ob-step4__feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{{ feature }}</span>
                </li>
              }
            </ul>

            <bk-button
              type="button"
              [variant]="plan.VcSlug === 'professional' ? 'primary' : 'secondary'"
              size="md"
              [loading]="loading() && selectedPlanId() === plan.Id"
              (clicked)="onSelectAndSubmit(plan.Id)"
            >
              Iniciar prueba gratuita
            </bk-button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .bk-ob-step4 {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-lg, 1.5rem);
      width: 100%;
    }

    .bk-ob-step4__back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--bk-color-text-muted, #64748b);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.8rem);
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .bk-ob-step4__back:hover {
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-ob-step4__error {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .bk-ob-step4__billing-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      background-color: var(--bk-bg-subtle, #f1f5f9);
      border-radius: var(--bk-border-radius-md, 0.75rem);
      padding: 4px;
      width: fit-content;
      margin: 0 auto;
    }

    .bk-ob-step4__toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1.25rem;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748b);
      background: transparent;
      border: none;
      border-radius: calc(var(--bk-border-radius-md, 0.75rem) - 4px);
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }

    .bk-ob-step4__toggle-btn--active {
      background-color: var(--bk-bg-surface, #ffffff);
      color: var(--bk-color-text-primary, #1e293b);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .bk-ob-step4__discount-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--bk-color-success, #22c55e);
      background-color: color-mix(in srgb, var(--bk-color-success, #22c55e) 12%, transparent);
      padding: 2px 6px;
      border-radius: 9999px;
    }

    .bk-ob-step4__plans {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--bk-space-md, 1rem);
      align-items: start;
    }

    @media (max-width: 768px) {
      .bk-ob-step4__plans {
        grid-template-columns: 1fr;
      }
    }

    .bk-ob-step4__plan-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      padding: var(--bk-space-lg, 1.5rem);
      background-color: var(--bk-bg-surface, #ffffff);
      border: 2px solid var(--bk-border-color-default, #e2e8f0);
      border-radius: var(--bk-border-radius-md, 1rem);
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    .bk-ob-step4__plan-card:hover {
      border-color: color-mix(in srgb, var(--bk-color-primary, #6366f1) 50%, transparent);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--bk-color-primary, #6366f1) 12%, transparent);
    }

    .bk-ob-step4__plan-card--selected {
      border-color: var(--bk-color-primary, #6366f1);
      box-shadow: 0 4px 20px color-mix(in srgb, var(--bk-color-primary, #6366f1) 20%, transparent);
    }

    .bk-ob-step4__plan-card--recommended {
      border-color: var(--bk-color-primary, #6366f1);
      transform: scale(1.02);
    }

    .bk-ob-step4__recommended-badge {
      position: absolute;
      top: -0.875rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--bk-color-primary, #6366f1);
      color: var(--bk-color-primary-contrast, #ffffff);
      font-family: var(--bk-font-family);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.875rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .bk-ob-step4__plan-header {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-xs, 0.25rem);
    }

    .bk-ob-step4__plan-name {
      margin: 0;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-lg, 1.125rem);
      font-weight: 700;
      color: var(--bk-color-text-primary, #1e293b);
    }

    .bk-ob-step4__plan-price {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .bk-ob-step4__price-amount {
      font-family: var(--bk-font-family);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--bk-color-primary, #6366f1);
      line-height: 1;
    }

    .bk-ob-step4__price-period {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-muted, #94a3b8);
    }

    .bk-ob-step4__plan-desc {
      margin: 0;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-secondary, #64748b);
      line-height: 1.5;
    }

    .bk-ob-step4__features {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .bk-ob-step4__feature-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-primary, #1e293b);
      line-height: 1.4;
    }

    .bk-ob-step4__feature-item svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
      color: var(--bk-color-success, #22c55e);
    }

    :host ::ng-deep .bk-ob-step4__plan-card bk-button,
    :host ::ng-deep .bk-ob-step4__plan-card bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class OnboardingStep4Component {
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly plans = input<Plan[]>([]);

  readonly submitted = output<OnboardingStep4Request>();
  readonly back = output<void>();

  readonly billingCycle = signal<'monthly' | 'yearly'>('monthly');
  readonly selectedPlanId = signal<number | null>(null);

  formatPrice(plan: Plan): string {
    const amount = this.billingCycle() === 'monthly' ? plan.IValueMonthly : plan.IValueYearly;
    return COP_FORMATTER.format(amount);
  }

  parsePlanFeatures(plan: Plan): string[] {
    const features: string[] = [];
    try {
      const props = JSON.parse(plan.TxProperties) as ParsedPlanProperties;
      if (props.maxProfessionals !== undefined) {
        const n = Number(props.maxProfessionals);
        features.push(n <= 0 ? 'Profesionales ilimitados' : `Hasta ${n} profesional${n === 1 ? '' : 'es'}`);
      }
      if (props.maxServices !== undefined) {
        const n = Number(props.maxServices);
        features.push(n <= 0 ? 'Servicios ilimitados' : `Hasta ${n} servicio${n === 1 ? '' : 's'}`);
      }
      if (props.maxBranches !== undefined) {
        const n = Number(props.maxBranches);
        features.push(n <= 0 ? 'Sucursales ilimitadas' : `Hasta ${n} sucursal${n === 1 ? '' : 'es'}`);
      }
    } catch {
      // TxProperties no es JSON válido
    }

    if (plan.IMaxConversation > 0) {
      features.push(plan.IMaxConversation >= 9999
        ? 'Conversaciones ilimitadas'
        : `${plan.IMaxConversation} conversaciones/mes`);
    }

    return features;
  }

  selectPlan(planId: number): void {
    this.selectedPlanId.set(planId);
  }

  onSelectAndSubmit(planId: number): void {
    this.selectedPlanId.set(planId);
    this.submitted.emit({
      PlanId: planId,
      VcBillingCycle: this.billingCycle(),
    });
  }
}
