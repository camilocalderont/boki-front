import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'bk-search-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-search-input">
      <svg class="bk-search-input__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        class="bk-search-input__field"
        type="text"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
      />
      @if (value()) {
        <button
          type="button"
          class="bk-search-input__clear"
          (click)="onClear()"
          aria-label="Limpiar búsqueda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: `
    .bk-search-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .bk-search-input__icon {
      position: absolute;
      left: 10px;
      color: var(--bk-color-text-muted, #94A3B8);
      pointer-events: none;
    }

    .bk-search-input__field {
      width: 100%;
      height: var(--bk-size-input-height, 36px);
      padding: 0 32px 0 34px;
      border: 1px solid var(--bk-border-color-default, #E2E8F0);
      border-radius: var(--bk-border-radius-full, 9999px);
      background: var(--bk-bg-surface, #fff);
      color: var(--bk-color-text-primary, #0F172A);
      font-size: var(--bk-font-size-sm, 12px);
      font-family: var(--bk-font-family);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .bk-search-input__field::placeholder {
      color: var(--bk-color-text-muted, #94A3B8);
    }

    .bk-search-input__field:focus {
      border-color: var(--bk-color-primary, #2563EB);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-primary, #2563EB) 15%, transparent);
    }

    .bk-search-input__clear {
      position: absolute;
      right: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--bk-color-text-muted, #94A3B8);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }

    .bk-search-input__clear:hover {
      color: var(--bk-color-text-primary, #0F172A);
      background: color-mix(in srgb, var(--bk-color-text-muted, #94A3B8) 15%, transparent);
    }
  `,
})
export class BkSearchInputComponent {
  readonly placeholder = input<string>('Buscar...');
  readonly searchChange = output<string>();

  readonly value = signal('');

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.searchChange.emit(val);
  }

  onClear(): void {
    this.value.set('');
    this.searchChange.emit('');
  }
}
