import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bk-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkTextareaComponent),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="bk-textarea__label">{{ label() }}</label>
    }

    <textarea
      [class]="textareaClass()"
      [placeholder]="placeholder()"
      [rows]="rows()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onBlur()"
    ></textarea>

    @if (error()) {
      <p class="bk-textarea__error">{{ error() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;

      /* ---- colour tokens ---- */
      --bk-textarea-bg: var(--bk-bg-surface, #ffffff);
      --bk-textarea-text: var(--bk-color-text-primary, #1e293b);
      --bk-textarea-placeholder: var(--bk-color-text-muted, #94a3b8);
      --bk-textarea-border: var(--bk-border-color-default, #cbd5e1);
      --bk-textarea-border-focus: var(--bk-color-primary, #6366f1);
      --bk-textarea-error-color: var(--bk-color-danger, #ef4444);
      --bk-textarea-label-color: var(--bk-color-text-secondary, #475569);
      --bk-textarea-disabled-opacity: var(--bk-disabled-opacity, 0.55);

      /* ---- shape tokens ---- */
      --bk-textarea-radius: var(--bk-border-radius-md, 0.5rem);
      --bk-textarea-border-width: var(--bk-border-width-default, 1px);
      --bk-textarea-padding-x: var(--bk-space-sm, 0.75rem);
      --bk-textarea-padding-y: var(--bk-space-xs, 0.5rem);
      --bk-textarea-font-size: var(--bk-font-size-base, 0.875rem);
      --bk-textarea-label-font-size: var(--bk-font-size-sm, 0.75rem);
      --bk-textarea-label-font-weight: var(--bk-font-weight-bold, 600);
      --bk-textarea-shadow: var(--bk-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      --bk-textarea-focus-ring: var(--bk-focus-ring, 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 40%, transparent));
      --bk-textarea-transition: var(--bk-transition-fast, 150ms ease);
    }

    .bk-textarea__label {
      display: block;
      margin-bottom: 0.375rem;
      font-size: var(--bk-textarea-label-font-size);
      font-weight: var(--bk-textarea-label-font-weight);
      color: var(--bk-textarea-label-color);
      line-height: 1.4;
    }

    .bk-textarea__native {
      display: block;
      width: 100%;
      padding: var(--bk-textarea-padding-y) var(--bk-textarea-padding-x);
      font-family: inherit;
      font-size: var(--bk-textarea-font-size);
      color: var(--bk-textarea-text);
      background-color: var(--bk-textarea-bg);
      border: var(--bk-textarea-border-width) solid var(--bk-textarea-border);
      border-radius: var(--bk-textarea-radius);
      box-shadow: var(--bk-textarea-shadow);
      resize: vertical;
      transition: border-color var(--bk-textarea-transition),
                  box-shadow var(--bk-textarea-transition);
    }

    .bk-textarea__native::placeholder {
      color: var(--bk-textarea-placeholder);
    }

    .bk-textarea__native:focus {
      outline: none;
      border-color: var(--bk-textarea-border-focus);
      box-shadow: var(--bk-textarea-focus-ring);
    }

    .bk-textarea__native:disabled {
      cursor: not-allowed;
      opacity: var(--bk-textarea-disabled-opacity);
    }

    .bk-textarea__native--error {
      border-color: var(--bk-textarea-error-color);
    }

    .bk-textarea__native--error:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-textarea-error-color) 40%, transparent);
    }

    .bk-textarea__error {
      margin: 0.25rem 0 0;
      font-size: var(--bk-textarea-label-font-size);
      color: var(--bk-textarea-error-color);
      line-height: 1.4;
    }
  `,
})
export class BkTextareaComponent implements ControlValueAccessor {
  /** Placeholder text for the textarea. */
  readonly placeholder = input<string>('');

  /** Label displayed above the textarea. */
  readonly label = input<string>('');

  /** Error message displayed below the textarea. */
  readonly error = input<string>('');

  /** Whether the textarea is disabled. */
  readonly disabled = input<boolean>(false);

  /** Number of visible text rows. */
  readonly rows = input<number>(3);

  /** Internal value signal. */
  readonly value = signal<string>('');

  /** Computed CSS class string for the textarea element. */
  readonly textareaClass = computed(() => {
    const base = 'bk-textarea__native';
    return this.error() ? `${base} ${base}--error` : base;
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onBlur(): void {
    this.onTouched();
  }

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
    // handled via the disabled() input signal;
    // if the form sets disabled state, we reflect it through the template binding
  }
}
