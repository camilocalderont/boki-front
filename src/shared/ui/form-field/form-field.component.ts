import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

@Component({
  selector: 'bk-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-form-field">
      @if (label()) {
        <label class="bk-form-field__label">{{ label() }}</label>
      }
      <ng-content />
      @if (error()) {
        <span class="bk-form-field__error">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="bk-form-field__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .bk-form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bk-form-field__label {
      font-size: var(--bk-font-size-sm, 12px);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748B);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .bk-form-field__error {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-danger, #EF4444);
      line-height: 1.3;
    }

    .bk-form-field__hint {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted, #94A3B8);
      line-height: 1.3;
    }
  `,
})
export class BkFormFieldComponent {
  readonly label = input<string>('');
  readonly error = input<string>('');
  readonly hint = input<string>('');
}
