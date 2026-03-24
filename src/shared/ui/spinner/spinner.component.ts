import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bk-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-label': 'Cargando',
  },
  template: `
    <svg
      [class]="hostClasses()"
      [style]="hostStyles()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="bk-spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        class="bk-spinner-arc"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .bk-spinner {
      animation: bk-spin 0.75s linear infinite;
    }

    .bk-spinner-sm { width: 1rem;   height: 1rem; }
    .bk-spinner-md { width: 1.5rem; height: 1.5rem; }
    .bk-spinner-lg { width: 2.5rem; height: 2.5rem; }

    .bk-spinner-track {
      opacity: 0.2;
    }

    .bk-spinner-arc {
      opacity: 1;
    }

    @keyframes bk-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `,
})
export class BkSpinnerComponent {
  /** Size preset for the spinner. */
  size = input<SpinnerSize>('md');

  /** Custom color override. Defaults to var(--bk-color-primary). */
  color = input<string>('');

  /** Computed CSS classes combining base and size. */
  hostClasses = computed(() => `bk-spinner bk-spinner-${this.size()}`);

  /** Computed inline style for color override. */
  hostStyles = computed(() => {
    const c = this.color();
    return `color: ${c || 'var(--bk-color-primary, #3b82f6)'}`;
  });
}
