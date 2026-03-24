import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type BkToggleSize = 'sm' | 'md';

@Component({
  selector: 'bk-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkToggleComponent),
      multi: true,
    },
  ],
  template: `
    <label [class]="hostClass()">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [class]="trackClass()"
        [disabled]="disabled()"
        (click)="toggle()"
      >
        <span [class]="thumbClass()"></span>
      </button>

      @if (label()) {
        <span class="bk-toggle__label">{{ label() }}</span>
      }
    </label>
  `,
  styles: `
    :host {
      display: inline-block;

      /* ---- colour tokens ---- */
      --bk-toggle-track-off: var(--bk-color-text-muted, #cbd5e1);
      --bk-toggle-track-on: var(--bk-color-primary, #6366f1);
      --bk-toggle-thumb: var(--bk-bg-surface, #ffffff);
      --bk-toggle-label-color: var(--bk-color-text-primary, #1e293b);
      --bk-toggle-disabled-opacity: var(--bk-disabled-opacity, 0.55);
      --bk-toggle-focus-ring: var(--bk-focus-ring, 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 40%, transparent));
      --bk-toggle-transition: var(--bk-transition-fast, 150ms ease);
      --bk-toggle-shadow: var(--bk-shadow-sm, 0 1px 2px rgba(0,0,0,0.1));

      /* ---- size: md ---- */
      --bk-toggle-md-width: 2.75rem;
      --bk-toggle-md-height: 1.5rem;
      --bk-toggle-md-thumb: 1.25rem;
      --bk-toggle-md-offset: 0.125rem;
      --bk-toggle-md-label-font: var(--bk-font-size-base, 0.875rem);

      /* ---- size: sm ---- */
      --bk-toggle-sm-width: 2rem;
      --bk-toggle-sm-height: 1.125rem;
      --bk-toggle-sm-thumb: 0.875rem;
      --bk-toggle-sm-offset: 0.125rem;
      --bk-toggle-sm-label-font: var(--bk-font-size-sm, 0.75rem);
    }

    .bk-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .bk-toggle--disabled {
      cursor: not-allowed;
      opacity: var(--bk-toggle-disabled-opacity);
    }

    /* ---- track ---- */

    .bk-toggle__track {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 9999px;
      background-color: var(--bk-toggle-track-off);
      transition: background-color var(--bk-toggle-transition);
    }

    .bk-toggle__track:focus-visible {
      outline: none;
      box-shadow: var(--bk-toggle-focus-ring);
    }

    .bk-toggle__track:disabled {
      cursor: not-allowed;
    }

    .bk-toggle__track--on {
      background-color: var(--bk-toggle-track-on);
    }

    /* ---- track sizes ---- */

    .bk-toggle__track--md {
      width: var(--bk-toggle-md-width);
      height: var(--bk-toggle-md-height);
    }

    .bk-toggle__track--sm {
      width: var(--bk-toggle-sm-width);
      height: var(--bk-toggle-sm-height);
    }

    /* ---- thumb ---- */

    .bk-toggle__thumb {
      display: block;
      border-radius: 9999px;
      background-color: var(--bk-toggle-thumb);
      box-shadow: var(--bk-toggle-shadow);
      transition: transform var(--bk-toggle-transition);
    }

    /* md thumb */
    .bk-toggle__thumb--md {
      width: var(--bk-toggle-md-thumb);
      height: var(--bk-toggle-md-thumb);
      transform: translateX(var(--bk-toggle-md-offset));
    }

    .bk-toggle__thumb--md-on {
      transform: translateX(calc(var(--bk-toggle-md-width) - var(--bk-toggle-md-thumb) - var(--bk-toggle-md-offset)));
    }

    /* sm thumb */
    .bk-toggle__thumb--sm {
      width: var(--bk-toggle-sm-thumb);
      height: var(--bk-toggle-sm-thumb);
      transform: translateX(var(--bk-toggle-sm-offset));
    }

    .bk-toggle__thumb--sm-on {
      transform: translateX(calc(var(--bk-toggle-sm-width) - var(--bk-toggle-sm-thumb) - var(--bk-toggle-sm-offset)));
    }

    /* ---- label ---- */

    .bk-toggle__label {
      color: var(--bk-toggle-label-color);
      user-select: none;
    }

    .bk-toggle--sm .bk-toggle__label {
      font-size: var(--bk-toggle-sm-label-font);
    }

    .bk-toggle--md .bk-toggle__label {
      font-size: var(--bk-toggle-md-label-font);
    }
  `,
})
export class BkToggleComponent implements ControlValueAccessor {
  /** Optional label displayed beside the toggle. */
  readonly label = input<string>('');

  /** Whether the toggle is disabled. */
  readonly disabled = input<boolean>(false);

  /** Size preset: sm or md. */
  readonly size = input<BkToggleSize>('md');

  /** Internal checked state. */
  readonly checked = signal<boolean>(false);

  /** Computed host wrapper class. */
  readonly hostClass = computed(() => {
    const classes = ['bk-toggle', `bk-toggle--${this.size()}`];
    if (this.disabled()) classes.push('bk-toggle--disabled');
    return classes.join(' ');
  });

  /** Computed track class combining size and on/off state. */
  readonly trackClass = computed(() => {
    const base = 'bk-toggle__track';
    const classes = [base, `${base}--${this.size()}`];
    if (this.checked()) classes.push(`${base}--on`);
    return classes.join(' ');
  });

  /** Computed thumb class combining size and on/off state. */
  readonly thumbClass = computed(() => {
    const s = this.size();
    const base = 'bk-toggle__thumb';
    const classes = [base, `${base}--${s}`];
    if (this.checked()) classes.push(`${base}--${s}-on`);
    return classes.join(' ');
  });

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
