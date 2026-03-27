import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'bk-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="bk-modal-overlay"
        (click)="onBackdropClick()"
      >
        <div
          class="bk-modal-content"
          [class]="panelClasses()"
          (click)="$event.stopPropagation()"
        >
          <header class="bk-modal-header">
            <h2 class="bk-modal-title">{{ title() }}</h2>
            @if (closeable()) {
              <button
                type="button"
                class="bk-modal-close"
                aria-label="Cerrar"
                (click)="close()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            }
          </header>

          <div class="bk-modal-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .bk-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--bk-z-modal, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bk-bg-overlay, rgba(0, 0, 0, 0.5));
      animation: bk-modal-fade-in 0.15s ease-out;
    }

    .bk-modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--bk-bg-surface, #fff);
      border-radius: var(--bk-border-radius-lg, 12px);
      box-shadow: var(--bk-shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3));
      max-height: 90vh;
      overflow: visible;
      animation: bk-modal-scale-in 0.2s ease-out;
    }

    .bk-modal-sm { width: min(24rem, 95vw); }
    .bk-modal-md { width: min(32rem, 95vw); }
    .bk-modal-lg { width: min(48rem, 95vw); }
    .bk-modal-xl { width: min(64rem, 95vw); }

    .bk-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .bk-modal-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
    }

    .bk-modal-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: var(--bk-border-radius-lg, 8px);
      background: transparent;
      color: var(--bk-color-text-secondary, #6b7280);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .bk-modal-close:hover {
      background: var(--bk-color-bg-hover, rgba(0, 0, 0, 0.06));
      color: var(--bk-color-text-primary, #111827);
    }

    .bk-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: calc(90vh - 4rem);
    }

    @keyframes bk-modal-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes bk-modal-scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `,
})
export class BkModalComponent {
  /** Whether the modal is open. */
  open = input<boolean>(false);

  /** Title displayed in the modal header. */
  title = input<string>('');

  /** Width preset for the modal panel. */
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Whether the modal can be closed by the user. */
  closeable = input<boolean>(true);

  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdrop = input<boolean>(false);

  /** Emitted when the modal requests to be closed. */
  closed = output<void>();

  /** Computed CSS class for the panel size. */
  panelClasses = computed(() => `bk-modal-content bk-modal-${this.size()}`);

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open() && this.closeable()) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeable() && this.closeOnBackdrop()) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
