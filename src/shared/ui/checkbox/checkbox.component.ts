import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type BkCheckboxSize = 'sm' | 'md' | 'lg';
export type BkCheckboxColor = 'primary' | 'secondary' | 'success' | 'danger' | 'amber' | 'teal' | 'indigo' | 'purple' | 'pink';
export type BkCheckboxShape = 'rounded' | 'square' | 'circle';

@Component({
  selector: 'bk-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkCheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label [class]="hostClass()" [style.--_cb-color]="colorVar()" (click)="$event.stopPropagation()">
      <span [class]="boxWrapperClass()">
        <input
          type="checkbox"
          class="bk-checkbox__native"
          [checked]="checked()"
          [disabled]="disabled()"
          (change)="onToggle()"
          (blur)="onTouched()"
        />
        <span [class]="boxClass()">
          @if (checked()) {
            <svg
              [class]="'bk-checkbox__icon bk-checkbox__icon--' + size()"
              [attr.viewBox]="iconViewBox()"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              @switch (icon()) {
                @case ('check') {
                  <polyline points="20 6 9 17 4 12" />
                }
                @case ('minus') {
                  <line x1="5" y1="12" x2="19" y2="12" />
                }
                @case ('heart') {
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none" />
                }
                @case ('star') {
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />
                }
                @default {
                  <polyline points="20 6 9 17 4 12" />
                }
              }
            </svg>
          }
        </span>
        @if (ripple()) {
          <span class="bk-checkbox__ripple" [class.bk-checkbox__ripple--active]="rippleActive()"></span>
        }
      </span>

      @if (label()) {
        <span class="bk-checkbox__label">
          {{ label() }}
          @if (linkText() && linkHref()) {
            <a [href]="linkHref()" class="bk-checkbox__link" target="_blank" rel="noopener" (click)="$event.stopPropagation()">{{ linkText() }}</a>
          }
        </span>
      }
    </label>
  `,
  styles: `
    :host {
      display: inline-block;
      --bk-cb-primary: var(--bk-color-primary, #2563eb);
      --bk-cb-secondary: var(--bk-color-secondary, #64748b);
      --bk-cb-success: var(--bk-color-success, #16a34a);
      --bk-cb-danger: var(--bk-color-danger, #dc2626);
      --bk-cb-amber: #d97706; --bk-cb-teal: #0d9488;
      --bk-cb-indigo: #4f46e5; --bk-cb-purple: #7c3aed; --bk-cb-pink: #db2777;
      --bk-cb-border: var(--bk-border-color-default, #94a3b8);
      --bk-cb-label: var(--bk-color-text-primary, #1e293b);
      --bk-cb-t: var(--bk-transition-fast, 150ms ease);
    }
    .bk-checkbox { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
    .bk-checkbox--disabled { cursor: not-allowed; opacity: 0.45; }
    .bk-checkbox__native { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; clip: rect(0 0 0 0); overflow: hidden; }
    .bk-checkbox__box-wrapper { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .bk-checkbox__box {
      display: inline-flex; align-items: center; justify-content: center;
      border: 2px solid var(--bk-cb-border); background: transparent;
      transition: background-color var(--bk-cb-t), border-color var(--bk-cb-t), box-shadow var(--bk-cb-t);
      position: relative; z-index: 1;
    }
    .bk-checkbox__box--sm { width: 16px; height: 16px; --_r: 3px; }
    .bk-checkbox__box--md { width: 20px; height: 20px; --_r: 4px; }
    .bk-checkbox__box--lg { width: 24px; height: 24px; --_r: 5px; }
    .bk-checkbox__box--rounded { border-radius: var(--_r); }
    .bk-checkbox__box--square { border-radius: 2px; }
    .bk-checkbox__box--circle { border-radius: 50%; }
    .bk-checkbox__box--checked { background-color: var(--_cb-color); border-color: var(--_cb-color); }
    .bk-checkbox__native:focus-visible ~ .bk-checkbox__box { box-shadow: 0 0 0 3px color-mix(in srgb, var(--_cb-color) 30%, transparent); }
    .bk-checkbox__icon { color: #fff; display: block; }
    .bk-checkbox__icon--sm { width: 10px; height: 10px; }
    .bk-checkbox__icon--md { width: 13px; height: 13px; }
    .bk-checkbox__icon--lg { width: 16px; height: 16px; }
    .bk-checkbox__ripple {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 250%; height: 250%; border-radius: 50%;
      background: color-mix(in srgb, var(--_cb-color) 15%, transparent);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
      opacity: 0; z-index: 0; pointer-events: none;
    }
    .bk-checkbox__ripple--active { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    .bk-checkbox:not(.bk-checkbox--disabled) .bk-checkbox__box-wrapper:hover .bk-checkbox__ripple { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    .bk-checkbox__label { color: var(--bk-cb-label); line-height: 1.4; }
    .bk-checkbox--sm .bk-checkbox__label { font-size: var(--bk-font-size-sm, 12px); }
    .bk-checkbox--md .bk-checkbox__label, .bk-checkbox--lg .bk-checkbox__label { font-size: var(--bk-font-size-base, 14px); }
    .bk-checkbox__link { color: var(--_cb-color); text-decoration: underline; text-underline-offset: 2px; font-weight: 500; transition: opacity var(--bk-cb-t); }
    .bk-checkbox__link:hover { opacity: 0.8; }
  `,
})
export class BkCheckboxComponent implements ControlValueAccessor {
  /** Text label beside the checkbox. */
  readonly label = input<string>('');

  /** Whether the checkbox is disabled. */
  readonly disabled = input<boolean>(false);

  /** Size preset. */
  readonly size = input<BkCheckboxSize>('md');

  /** Color variant. */
  readonly color = input<BkCheckboxColor>('primary');

  /** Shape of the checkbox box. */
  readonly shape = input<BkCheckboxShape>('rounded');

  /** Whether to show ripple effect on click. */
  readonly ripple = input<boolean>(true);

  /** Custom icon: check (default), minus (indeterminate), heart, star. */
  readonly icon = input<'check' | 'minus' | 'heart' | 'star'>('check');

  /** Link text shown after the label. */
  readonly linkText = input<string>('');

  /** Link href. */
  readonly linkHref = input<string>('');

  /** Emits when checked state changes (for template-driven usage). */
  readonly changed = output<boolean>();

  /** Internal checked state. */
  readonly checked = signal(false);

  /** Ripple animation state. */
  readonly rippleActive = signal(false);

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  readonly iconViewBox = computed(() => '0 0 24 24');

  readonly colorVar = computed(() => {
    const map: Record<BkCheckboxColor, string> = {
      primary:   'var(--bk-cb-primary)',
      secondary: 'var(--bk-cb-secondary)',
      success:   'var(--bk-cb-success)',
      danger:    'var(--bk-cb-danger)',
      amber:     'var(--bk-cb-amber)',
      teal:      'var(--bk-cb-teal)',
      indigo:    'var(--bk-cb-indigo)',
      purple:    'var(--bk-cb-purple)',
      pink:      'var(--bk-cb-pink)',
    };
    return map[this.color()] ?? map['primary'];
  });

  readonly hostClass = computed(() => {
    const classes = ['bk-checkbox', `bk-checkbox--${this.size()}`];
    if (this.disabled()) classes.push('bk-checkbox--disabled');
    return classes.join(' ');
  });

  readonly boxWrapperClass = computed(() =>
    `bk-checkbox__box-wrapper bk-checkbox__box-wrapper--${this.size()}`
  );

  readonly boxClass = computed(() => {
    const s = this.size();
    const classes = [
      'bk-checkbox__box',
      `bk-checkbox__box--${s}`,
      `bk-checkbox__box--${this.shape()}`,
    ];
    if (this.checked()) classes.push('bk-checkbox__box--checked');
    return classes.join(' ');
  });

  onToggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.changed.emit(next);

    if (this.ripple()) {
      this.rippleActive.set(true);
      setTimeout(() => this.rippleActive.set(false), 300);
    }
  }

  // ── ControlValueAccessor ──

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled via disabled() input binding from reactive forms
  }
}
