import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

interface StepDef {
  number: number;
  label: string;
}

const STEPS: StepDef[] = [
  { number: 1, label: 'Tus datos' },
  { number: 2, label: 'Tu negocio' },
  { number: 3, label: '¿Qué necesitás?' },
  { number: 4, label: 'Tu plan' },
];

@Component({
  selector: 'bk-onboarding-step-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-step-indicator">
      @for (step of steps; track step.number; let last = $last) {
        <div class="bk-step-indicator__item">
          <div
            class="bk-step-indicator__circle"
            [class.bk-step-indicator__circle--completed]="isCompleted(step.number)"
            [class.bk-step-indicator__circle--active]="isActive(step.number)"
          >
            @if (isCompleted(step.number)) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            } @else {
              <span>{{ step.number }}</span>
            }
          </div>
          <span
            class="bk-step-indicator__label"
            [class.bk-step-indicator__label--active]="isActive(step.number)"
            [class.bk-step-indicator__label--completed]="isCompleted(step.number)"
          >
            {{ step.label }}
          </span>
        </div>

        @if (!last) {
          <div
            class="bk-step-indicator__line"
            [class.bk-step-indicator__line--completed]="isCompleted(step.number)"
          ></div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .bk-step-indicator {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 0;
      width: 100%;
      padding: var(--bk-space-md, 1rem) 0;
    }

    .bk-step-indicator__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--bk-space-xs, 0.25rem);
      flex-shrink: 0;
    }

    .bk-step-indicator__circle {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      border: 2px solid var(--bk-border-color-default, #cbd5e1);
      background-color: var(--bk-bg-surface, #ffffff);
      color: var(--bk-color-text-muted, #94a3b8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 600;
      transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    }

    .bk-step-indicator__circle svg {
      width: 1rem;
      height: 1rem;
    }

    .bk-step-indicator__circle--active {
      border-color: var(--bk-color-primary, #6366f1);
      background-color: var(--bk-color-primary, #6366f1);
      color: var(--bk-color-primary-contrast, #ffffff);
    }

    .bk-step-indicator__circle--completed {
      border-color: var(--bk-color-success, #22c55e);
      background-color: var(--bk-color-success, #22c55e);
      color: #ffffff;
    }

    .bk-step-indicator__label {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.7rem);
      color: var(--bk-color-text-muted, #94a3b8);
      text-align: center;
      max-width: 5rem;
      line-height: 1.2;
      transition: color 0.2s ease;
    }

    .bk-step-indicator__label--active {
      color: var(--bk-color-primary, #6366f1);
      font-weight: 600;
    }

    .bk-step-indicator__label--completed {
      color: var(--bk-color-success, #22c55e);
      font-weight: 500;
    }

    .bk-step-indicator__line {
      flex: 1;
      height: 2px;
      background-color: var(--bk-border-color-default, #cbd5e1);
      margin-top: 1.1rem;
      min-width: 1.5rem;
      transition: background-color 0.2s ease;
    }

    .bk-step-indicator__line--completed {
      background-color: var(--bk-color-success, #22c55e);
    }

    @media (max-width: 480px) {
      .bk-step-indicator__label {
        font-size: 0.6rem;
        max-width: 3.5rem;
      }

      .bk-step-indicator__circle {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 0.75rem;
      }
    }
  `,
})
export class OnboardingStepIndicatorComponent {
  readonly currentStep = input.required<number>();

  readonly steps = STEPS;

  isActive(stepNumber: number): boolean {
    return this.currentStep() === stepNumber;
  }

  isCompleted(stepNumber: number): boolean {
    return this.currentStep() > stepNumber;
  }
}
