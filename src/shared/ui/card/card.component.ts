import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

@Component({
  selector: 'bk-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="hostClasses()">
      <ng-content />
    </div>
  `,
  styles: `
    .bk-card {
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-lg, 12px);
      box-shadow: var(--bk-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
    }

    .bk-card-padded {
      padding: 1.5rem;
    }

    .bk-card-hoverable {
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      cursor: pointer;
    }

    .bk-card-hoverable:hover {
      box-shadow: var(--bk-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
      transform: translateY(-2px);
    }
  `,
})
export class BkCardComponent {
  /** Whether the card has internal padding. */
  padding = input<boolean>(true);

  /** Whether the card shows a hover shadow effect. */
  hoverable = input<boolean>(false);

  /** Computed CSS classes combining base, padding, and hover states. */
  hostClasses = computed(() => {
    const classes = ['bk-card'];

    if (this.padding()) {
      classes.push('bk-card-padded');
    }

    if (this.hoverable()) {
      classes.push('bk-card-hoverable');
    }

    return classes.join(' ');
  });
}
