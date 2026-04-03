import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BkButtonComponent } from '@shared/ui';

@Component({
  selector: 'bk-service-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkButtonComponent],
  styles: `
    :host { display: block; }

    .service-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--bk-space-lg, 1.5rem) var(--bk-space-md, 1rem);
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-lg, 12px);
      margin-bottom: var(--bk-space-sm, 8px);
      transition: background-color 0.15s ease, border-color 0.15s ease;
      cursor: pointer;
    }

    .service-item:hover {
      background-color: color-mix(in srgb, var(--bk-color-primary) 5%, var(--bk-bg-surface, #fff));
      border-color: var(--bk-color-primary);
    }

    /* Force Reservar button to pill with visible border */
    ::ng-deep .bk-btn--ghost {
      border-radius: 999px !important;
      border: 1px solid var(--bk-border-color-default) !important;
      padding: 6px 16px !important;
    }

    ::ng-deep .bk-btn--ghost:hover {
      border-color: var(--bk-color-text-primary) !important;
    }

    .service-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .service-name {
      font-size: var(--bk-font-size-base);
      font-weight: 500;
      color: var(--bk-color-text-primary);
    }

    .service-duration {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
    }

    .service-price {
      font-size: var(--bk-font-size-sm);
      font-weight: 600;
      color: var(--bk-color-text-primary);
    }
  `,
  template: `
    <div class="service-item">
      <div class="service-info">
        <span class="service-name">{{ name() }}</span>
        @if (duration()) {
          <span class="service-duration">{{ duration() }}</span>
        }
        <span class="service-price">{{ formatPrice(price()) }}</span>
      </div>
      <bk-button variant="ghost" size="sm" (clicked)="book.emit()">Reservar</bk-button>
    </div>
  `,
})
export class ServiceListItemComponent {
  readonly name = input.required<string>();
  readonly duration = input<string>('');
  readonly price = input<number>(0);

  readonly book = output<void>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'decimal' }).format(price) + ' COP';
  }
}
