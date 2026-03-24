import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';

@Component({
  selector: 'bk-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-pagination">
      <div class="bk-pagination__size">
        <label class="bk-pagination__size-label">Mostrar</label>
        <select
          class="bk-pagination__size-select"
          [value]="pageSize()"
          (change)="onPageSizeChange($event)"
        >
          @for (size of pageSizeOptions(); track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
        <span class="bk-pagination__size-label">filas</span>
      </div>

      <div class="bk-pagination__nav">
        <span class="bk-pagination__info">
          {{ startItem() }}–{{ endItem() }} de {{ totalItems() }}
        </span>
        <button
          type="button"
          class="bk-pagination__btn"
          [disabled]="currentPage() <= 1"
          (click)="onPageChange(currentPage() - 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        @for (p of pages(); track p) {
          <button
            type="button"
            class="bk-pagination__btn"
            [class.bk-pagination__btn--active]="p === currentPage()"
            (click)="onPageChange(p)"
          >
            {{ p }}
          </button>
        }
        <button
          type="button"
          class="bk-pagination__btn"
          [disabled]="currentPage() >= totalPages()"
          (click)="onPageChange(currentPage() + 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .bk-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      gap: 16px;
    }

    .bk-pagination__size {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bk-pagination__size-label {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted, #94A3B8);
    }

    .bk-pagination__size-select {
      padding: 6px 28px 6px 10px;
      border: 1px solid var(--bk-border-color-default, #E2E8F0);
      border-radius: var(--bk-border-radius-sm, 6px);
      background-color: var(--bk-bg-surface, #fff);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      color: var(--bk-color-text-primary, #0F172A);
      font-size: var(--bk-font-size-sm, 12px);
      font-family: var(--bk-font-family);
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: border-color 0.15s;
    }

    .bk-pagination__size-select:focus {
      border-color: var(--bk-color-primary, #2563EB);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-primary, #2563EB) 15%, transparent);
    }

    .bk-pagination__nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .bk-pagination__info {
      font-size: var(--bk-font-size-sm, 12px);
      color: var(--bk-color-text-muted, #94A3B8);
      margin-right: 8px;
    }

    .bk-pagination__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: none;
      border-radius: var(--bk-border-radius-sm, 6px);
      background: transparent;
      color: var(--bk-color-text-secondary, #64748B);
      font-size: var(--bk-font-size-sm, 12px);
      font-family: var(--bk-font-family);
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }

    .bk-pagination__btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 8%, transparent);
      color: var(--bk-color-primary, #2563EB);
    }

    .bk-pagination__btn--active {
      background: var(--bk-color-primary, #2563EB) !important;
      color: #fff !important;
      font-weight: 600;
    }

    .bk-pagination__btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class BkPaginationComponent {
  readonly totalItems = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);

  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  readonly startItem = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChanged.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChanged.emit(size);
  }
}
