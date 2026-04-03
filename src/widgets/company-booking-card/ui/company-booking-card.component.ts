import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BkButtonComponent, BkIconComponent } from '@shared/ui';

@Component({
  selector: 'bk-company-booking-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkButtonComponent, BkIconComponent],
  styles: `
    :host { display: block; }

    .booking-card {
      background: var(--bk-bg-surface);
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-lg, 12px);
      padding: var(--bk-space-lg);
      box-shadow: var(--bk-shadow-card, var(--bk-shadow-md));
      margin-top: var(--bk-space-lg, 24px);
    }

    /* Force book button to be pill-shaped */
    .book-btn-wrapper ::ng-deep .bk-button,
    .book-btn-wrapper ::ng-deep button {
      border-radius: 999px !important;
    }

    .card-name {
      font-size: var(--bk-font-size-xl);
      font-weight: 700;
      color: var(--bk-color-text-primary);
      margin: 0 0 var(--bk-space-sm);
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
    }

    .card-name.visible {
      max-height: 60px;
      opacity: 1;
      margin-bottom: var(--bk-space-sm);
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: var(--bk-space-xs);
      margin-bottom: var(--bk-space-lg);
      font-size: var(--bk-font-size-sm);
    }

    .rating-value {
      font-weight: 700;
      color: var(--bk-color-text-primary);
    }

    .stars {
      color: #F59E0B;
    }

    .review-count {
      color: var(--bk-color-primary);
    }

    .book-btn-wrapper {
      display: block;
      width: 100%;
      margin-bottom: var(--bk-space-lg);
    }

    .book-btn-wrapper bk-button {
      width: 100%;
      display: block;
    }

    /* Force inner button to fill width */
    .book-btn-wrapper ::ng-deep .bk-button,
    .book-btn-wrapper ::ng-deep button {
      width: 100%;
    }

    .card-details {
      border-top: 1px solid var(--bk-border-color-default);
      padding-top: var(--bk-space-md);
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: var(--bk-space-sm);
      margin-bottom: var(--bk-space-sm);
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-secondary);
    }

    .schedule-text {
      color: var(--bk-color-text-muted);
    }

    .address-text {
      color: var(--bk-color-text-primary);
      line-height: 1.4;
    }

    .how-to-arrive {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-primary);
      text-decoration: none;
      margin-left: calc(20px + var(--bk-space-sm, 8px));
      display: inline-block;
      margin-top: var(--bk-space-xs, 4px);
    }

    .how-to-arrive:hover {
      text-decoration: underline;
    }
  `,
  template: `
    <div class="booking-card">
      <h2 class="card-name" [class.visible]="showName()">{{ companyName() }}</h2>

      @if (reviewCount() > 0) {
        <div class="card-rating">
          <span class="rating-value">{{ rating() }}</span>
          <span class="stars">★★★★★</span>
          <span class="review-count">({{ reviewCount() }})</span>
        </div>
      }

      <div class="book-btn-wrapper">
        <bk-button variant="primary" size="lg" (clicked)="bookNow.emit()">
          Reservar ahora
        </bk-button>
      </div>

      <div class="card-details">
        @if (scheduleText()) {
          <div class="detail-row">
            <bk-icon name="calendar" size="sm" />
            <span [style.color]="isOpen() ? 'var(--bk-color-success)' : 'var(--bk-color-danger)'">
              {{ isOpen() ? 'Abierto' : 'Cerrado' }}
            </span>
            <span class="schedule-text">{{ scheduleText() }}</span>
          </div>
        }

        @if (address()) {
          <div class="detail-row">
            <bk-icon name="building" size="sm" />
            <span class="address-text">{{ address() }}</span>
          </div>
          <a
            [href]="'https://maps.google.com/?q=' + address()"
            target="_blank"
            rel="noopener"
            class="how-to-arrive"
          >Cómo llegar</a>
        }
      </div>
    </div>
  `,
})
export class CompanyBookingCardComponent {
  readonly companyName = input<string>('');
  readonly showName = input<boolean>(false);
  readonly rating = input<number>(0);
  readonly reviewCount = input<number>(0);
  readonly isOpen = input<boolean>(false);
  readonly scheduleText = input<string>('');
  readonly address = input<string>('');

  readonly bookNow = output<void>();
}
