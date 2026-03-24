import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  HostListener,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface BkSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'bk-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkSelectComponent),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="bk-select__label">{{ label() }}</label>
    }

    <div class="bk-select__wrapper" #wrapper>
      <!-- Trigger button -->
      <button
        type="button"
        [class]="triggerClass()"
        [disabled]="disabled()"
        (click)="toggleDropdown()"
        (blur)="onBlur()"
      >
        <span class="bk-select__display" [class.bk-select__display--placeholder]="!displayText()">
          {{ displayText() || placeholder() }}
        </span>
        <svg class="bk-select__arrow" [class.bk-select__arrow--open]="isOpen()" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <div class="bk-select__dropdown">
          <!-- Search -->
          @if (searchable()) {
            <div class="bk-select__search-box">
              <input
                #searchInput
                type="text"
                class="bk-select__search"
                placeholder="Buscar..."
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
                (keydown.escape)="closeDropdown()"
              />
            </div>
          }

          <!-- Select all / none for multi -->
          @if (multiple()) {
            <div class="bk-select__bulk-actions">
              <button type="button" class="bk-select__bulk-btn" (click)="selectAll()">Todos</button>
              <button type="button" class="bk-select__bulk-btn" (click)="selectNone()">Ninguno</button>
            </div>
          }

          <!-- "Todos" option for single mode (acts as empty/clear) -->
          @if (!multiple() && showAllOption()) {
            <div
              class="bk-select__option"
              [class.bk-select__option--active]="!singleValue()"
              (click)="onSelectSingle('')"
            >
              {{ allOptionLabel() }}
            </div>
          }

          <!-- Options -->
          <div class="bk-select__options">
            @for (opt of filteredOptions(); track opt.value) {
              <div
                class="bk-select__option"
                [class.bk-select__option--active]="isSelected(opt.value)"
                (click)="onOptionClick(opt.value)"
              >
                @if (multiple()) {
                  <span class="bk-select__check" [class.bk-select__check--checked]="isSelected(opt.value)">
                    @if (isSelected(opt.value)) { &#10003; }
                  </span>
                }
                {{ opt.label }}
              </div>
            } @empty {
              <div class="bk-select__empty">Sin resultados</div>
            }
          </div>
        </div>
      }
    </div>

    @if (error()) {
      <p class="bk-select__error">{{ error() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      --bk-select-bg: var(--bk-bg-surface, #ffffff);
      --bk-select-text: var(--bk-color-text-primary, #1e293b);
      --bk-select-placeholder: var(--bk-color-text-muted, #94a3b8);
      --bk-select-border: var(--bk-border-color-default, #cbd5e1);
      --bk-select-border-focus: var(--bk-color-primary, #6366f1);
      --bk-select-error-color: var(--bk-color-danger, #ef4444);
      --bk-select-label-color: var(--bk-color-text-secondary, #475569);
      --bk-select-arrow-color: var(--bk-color-text-muted, #94a3b8);
      --bk-select-disabled-opacity: var(--bk-disabled-opacity, 0.55);
      --bk-select-radius: var(--bk-border-radius-md, 0.5rem);
      --bk-select-border-width: var(--bk-border-width-default, 1px);
      --bk-select-padding-x: var(--bk-space-sm, 0.75rem);
      --bk-select-height: var(--bk-size-input-height, 2.5rem);
      --bk-select-font-size: var(--bk-font-size-base, 0.875rem);
      --bk-select-label-font-size: var(--bk-font-size-sm, 0.75rem);
      --bk-select-label-font-weight: var(--bk-font-weight-bold, 600);
      --bk-select-shadow: var(--bk-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      --bk-select-focus-ring: var(--bk-focus-ring, 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 40%, transparent));
      --bk-select-transition: var(--bk-transition-fast, 150ms ease);
      --bk-select-dropdown-bg: var(--bk-bg-surface, #ffffff);
      --bk-select-option-hover: var(--bk-color-bg-hover, rgba(0,0,0,0.04));
      --bk-select-option-active-bg: color-mix(in srgb, var(--bk-color-primary, #6366f1) 12%, transparent);
      --bk-select-option-active-text: var(--bk-color-primary, #6366f1);
    }

    .bk-select__label {
      display: block;
      margin-bottom: 0.375rem;
      font-size: var(--bk-select-label-font-size);
      font-weight: var(--bk-select-label-font-weight);
      color: var(--bk-select-label-color);
      line-height: 1.4;
    }

    .bk-select__wrapper { position: relative; display: block; }

    .bk-select__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: var(--bk-select-height);
      padding: 0 var(--bk-select-padding-x);
      font-family: inherit;
      font-size: var(--bk-select-font-size);
      color: var(--bk-select-text);
      background-color: var(--bk-select-bg);
      border: var(--bk-select-border-width) solid var(--bk-select-border);
      border-radius: var(--bk-select-radius);
      box-shadow: var(--bk-select-shadow);
      cursor: pointer;
      transition: border-color var(--bk-select-transition), box-shadow var(--bk-select-transition);
      text-align: left;
    }
    .bk-select__trigger:focus { outline: none; border-color: var(--bk-select-border-focus); box-shadow: var(--bk-select-focus-ring); }
    .bk-select__trigger:disabled { cursor: not-allowed; opacity: var(--bk-select-disabled-opacity); }
    .bk-select__trigger--error { border-color: var(--bk-select-error-color); }
    .bk-select__trigger--open { border-color: var(--bk-select-border-focus); box-shadow: var(--bk-select-focus-ring); }

    .bk-select__display { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bk-select__display--placeholder { color: var(--bk-select-placeholder); }

    .bk-select__arrow {
      width: 1.25rem; height: 1.25rem; flex-shrink: 0;
      color: var(--bk-select-arrow-color);
      transition: transform var(--bk-select-transition);
    }
    .bk-select__arrow--open { transform: rotate(180deg); }

    .bk-select__dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0; right: 0;
      z-index: var(--bk-z-dropdown, 1000);
      background: var(--bk-select-dropdown-bg);
      border: var(--bk-select-border-width) solid var(--bk-select-border);
      border-radius: var(--bk-select-radius);
      box-shadow: var(--bk-shadow-lg, 0 10px 25px rgba(0,0,0,0.15));
      max-height: 280px;
      display: flex;
      flex-direction: column;
      animation: bk-select-fade 0.12s ease-out;
    }

    .bk-select__search-box { padding: 0.5rem; border-bottom: 1px solid var(--bk-select-border); }
    .bk-select__search {
      width: 100%;
      height: 2rem;
      padding: 0 0.5rem;
      font-family: inherit;
      font-size: var(--bk-select-font-size);
      color: var(--bk-select-text);
      background: var(--bk-select-bg);
      border: var(--bk-select-border-width) solid var(--bk-select-border);
      border-radius: calc(var(--bk-select-radius) - 2px);
      outline: none;
    }
    .bk-select__search:focus { border-color: var(--bk-select-border-focus); }

    .bk-select__bulk-actions {
      display: flex;
      gap: 0.25rem;
      padding: 0.375rem 0.5rem;
      border-bottom: 1px solid var(--bk-select-border);
    }
    .bk-select__bulk-btn {
      flex: 1;
      padding: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--bk-select-option-active-text);
      background: transparent;
      border: 1px solid var(--bk-select-border);
      border-radius: calc(var(--bk-select-radius) - 2px);
      cursor: pointer;
      transition: background var(--bk-select-transition);
    }
    .bk-select__bulk-btn:hover { background: var(--bk-select-option-hover); }

    .bk-select__options { overflow-y: auto; flex: 1; padding: 0.25rem 0; }

    .bk-select__option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: var(--bk-select-font-size);
      color: var(--bk-select-text);
      cursor: pointer;
      transition: background var(--bk-select-transition);
    }
    .bk-select__option:hover { background: var(--bk-select-option-hover); }
    .bk-select__option--active { background: var(--bk-select-option-active-bg); color: var(--bk-select-option-active-text); font-weight: 500; }

    .bk-select__check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem; height: 1rem;
      border: 2px solid var(--bk-select-border);
      border-radius: 3px;
      font-size: 0.65rem;
      flex-shrink: 0;
    }
    .bk-select__check--checked {
      background: var(--bk-select-option-active-text);
      border-color: var(--bk-select-option-active-text);
      color: #fff;
    }

    .bk-select__empty {
      padding: 0.75rem;
      text-align: center;
      color: var(--bk-select-placeholder);
      font-size: var(--bk-select-font-size);
    }

    .bk-select__error {
      margin: 0.25rem 0 0;
      font-size: var(--bk-select-label-font-size);
      color: var(--bk-select-error-color);
      line-height: 1.4;
    }

    @keyframes bk-select-fade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class BkSelectComponent implements ControlValueAccessor {
  /** Placeholder text when nothing is selected. */
  readonly placeholder = input<string>('Seleccione...');
  /** Label displayed above the select. */
  readonly label = input<string>('');
  /** Error message below. */
  readonly error = input<string>('');
  /** Whether the select is disabled. */
  readonly disabled = input<boolean>(false);
  /** Enable search filtering. */
  readonly searchable = input<boolean>(true);
  /** Enable multi-selection mode. */
  readonly multiple = input<boolean>(false);
  /** Options array — use this instead of ng-content for searchable/multi. */
  readonly options = input<BkSelectOption[]>([]);
  /** Show a "Todos" / clear option in single mode. */
  readonly showAllOption = input<boolean>(false);
  /** Label for the "all" option in single mode. */
  readonly allOptionLabel = input<string>('Todos');

  // ── Internal state ──
  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly singleValue = signal<string>('');
  readonly multiValues = signal<Set<string>>(new Set());

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const opts = this.options();
    if (!term) return opts;
    return opts.filter(o => o.label.toLowerCase().includes(term));
  });

  readonly displayText = computed(() => {
    if (this.multiple()) {
      const selected = this.multiValues();
      if (selected.size === 0) return '';
      if (selected.size === this.options().length) return 'Todos';
      const labels = this.options()
        .filter(o => selected.has(o.value))
        .map(o => o.label);
      return labels.join(', ');
    }
    const val = this.singleValue();
    if (!val) return '';
    return this.options().find(o => o.value === val)?.label ?? val;
  });

  readonly triggerClass = computed(() => {
    let cls = 'bk-select__trigger';
    if (this.error()) cls += ' bk-select__trigger--error';
    if (this.isOpen()) cls += ' bk-select__trigger--open';
    return cls;
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const wrapper = (this as any).__wrapper;
    if (wrapper && !wrapper.contains(event.target)) {
      this.closeDropdown();
    }
  }

  constructor(private hostEl: ElementRef) {}

  toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.searchTerm.set('');
      setTimeout(() => this.searchInput()?.nativeElement?.focus(), 50);
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  isSelected(value: string): boolean {
    if (this.multiple()) return this.multiValues().has(value);
    return this.singleValue() === value;
  }

  onOptionClick(value: string): void {
    if (this.multiple()) {
      this.multiValues.update(set => {
        const next = new Set(set);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
      });
      this.emitMultiValue();
    } else {
      this.onSelectSingle(value);
    }
  }

  onSelectSingle(value: string): void {
    this.singleValue.set(value);
    this.onChange(value);
    this.closeDropdown();
  }

  selectAll(): void {
    const all = new Set(this.options().map(o => o.value));
    this.multiValues.set(all);
    this.emitMultiValue();
  }

  selectNone(): void {
    this.multiValues.set(new Set());
    this.emitMultiValue();
  }

  onBlur(): void {
    this.onTouched();
  }

  // ── ControlValueAccessor ──

  writeValue(value: any): void {
    if (this.multiple()) {
      if (Array.isArray(value)) {
        this.multiValues.set(new Set(value.map(String)));
      } else {
        this.multiValues.set(new Set());
      }
    } else {
      this.singleValue.set(value != null ? String(value) : '');
    }
  }

  registerOnChange(fn: (value: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(_: boolean): void {}

  private emitMultiValue(): void {
    this.onChange(Array.from(this.multiValues()));
  }

  // Close dropdown when clicking outside
  ngAfterViewInit(): void {
    (this as any).__wrapper = this.hostEl.nativeElement;
  }
}
