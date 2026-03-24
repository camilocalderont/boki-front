import {
  Component,
  ChangeDetectionStrategy,
  input,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bk-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="bk-input-wrapper">
      @if (label()) {
        <label class="bk-input-label">{{ label() }}</label>
      }
      <input
        class="bk-input"
        [class.bk-input--error]="!!error()"
        [class.bk-input--disabled]="disabled() || isDisabled()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled() || isDisabled()"
        [value]="value()"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
      />
      @if (error()) {
        <span class="bk-input-error">{{ error() }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .bk-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-xs);
    }

    .bk-input-label {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 12px);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748B);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .bk-input {
      width: 100%;
      height: var(--bk-size-input-height);
      padding: 0 var(--bk-space-sm);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-base);
      color: var(--bk-color-text-primary);
      background-color: var(--bk-bg-surface);
      border: var(--bk-border-width-default) solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .bk-input::placeholder {
      color: var(--bk-color-text-muted);
    }

    .bk-input:focus {
      border-color: var(--bk-color-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-primary) 20%, transparent);
    }

    .bk-input--error {
      border-color: var(--bk-color-danger);
    }

    .bk-input--error:focus {
      border-color: var(--bk-color-danger);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-danger) 20%, transparent);
    }

    .bk-input--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .bk-input-error {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-danger);
      line-height: 1.3;
    }
  `,
})
export class BkInputComponent implements ControlValueAccessor {
  /* --- Signal inputs --- */
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly label = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);

  /* --- Internal state --- */
  readonly value = signal<string>('');
  readonly isDisabled = signal<boolean>(false);

  /* --- CVA callbacks --- */
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  /* --- ControlValueAccessor implementation --- */
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
