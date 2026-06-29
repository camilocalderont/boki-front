import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BkSearchInputComponent, BkPaginationComponent, BkButtonComponent, BkIconComponent } from '@shared/ui';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  cellTemplate?: TemplateRef<{ $implicit: any; row: any }>;
}

@Component({
  selector: 'bk-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, BkSearchInputComponent, BkPaginationComponent, BkButtonComponent, BkIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Slot para filtros personalizados (fuera de la tarjeta) -->
    <div class="bk-data-table__filters" [style.justify-content]="filterPosition() === 'right' ? 'flex-end' : 'flex-start'">
      <ng-content select="[tableFilters]" />
    </div>

    <div class="bk-data-table">
      @if (showToolbar()) {
        <div class="bk-data-table__toolbar">
          <div class="bk-data-table__toolbar-left">
            <ng-content select="[tableActions]" />
          </div>
          <div class="bk-data-table__toolbar-right">
            <bk-search-input
              [placeholder]="searchPlaceholder()"
              (searchChange)="onSearch($event)"
            />
          </div>
        </div>
      }

      <div class="bk-data-table__wrapper">
        <table class="bk-data-table__table">
          <thead>
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  class="bk-data-table__th"
                  [style.width]="col.width || 'auto'"
                  [class.bk-data-table__th--sortable]="col.sortable"
                  (click)="col.sortable ? onSort(col.key) : null"
                >
                  {{ col.label }}
                  @if (col.sortable && sortKey() === col.key) {
                    <span class="bk-data-table__sort-icon">
                      {{ sortDirection() === 'asc' ? '\u2191' : '\u2193' }}
                    </span>
                  }
                </th>
              }
              @if (showActions()) {
                <th class="bk-data-table__th bk-data-table__th--actions">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of pagedData(); track trackId($index, row)) {
              <tr class="bk-data-table__tr">
                @for (col of columns(); track col.key) {
                  <td class="bk-data-table__td">
                    @if (col.cellTemplate) {
                      <ng-container *ngTemplateOutlet="col.cellTemplate; context: { $implicit: resolveValue(row, col.key), row: row }" />
                    } @else {
                      {{ resolveValue(row, col.key) }}
                    }
                  </td>
                }
                @if (showActions()) {
                  <td class="bk-data-table__td bk-data-table__td--actions">
                    @if (rowActionsTemplate) {
                      <ng-container *ngTemplateOutlet="rowActionsTemplate; context: { $implicit: row }" />
                    } @else {
                      <div class="bk-data-table__action-group">
                        @if (showEditAction()) {
                          <bk-button variant="ghost" size="sm" (clicked)="editClicked.emit(row)">
                            <bk-icon name="edit" size="sm" />
                          </bk-button>
                        }
                        @if (showScheduleAction()) {
                          <bk-button variant="ghost" size="sm" (clicked)="scheduleClicked.emit(row)">
                            <bk-icon name="calendar" size="sm" />
                          </bk-button>
                        }
                        @if (showStagesAction()) {
                          <bk-button variant="ghost" size="sm" (clicked)="stagesClicked.emit(row)">
                            <bk-icon name="list" size="sm" />
                          </bk-button>
                        }
                        @if (showPortfolioAction()) {
                          <bk-button variant="ghost" size="sm" (clicked)="portfolioClicked.emit(row)">
                            <bk-icon name="photo" size="sm" />
                          </bk-button>
                        }
                        @if (showDeleteAction()) {
                          <bk-button variant="ghost" size="sm" (clicked)="deleteClicked.emit(row)">
                            <bk-icon name="trash" size="sm" class="text-red-500" />
                          </bk-button>
                        }
                      </div>
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td class="bk-data-table__empty" [attr.colspan]="columns().length + (showActions() ? 1 : 0)">
                  {{ emptyMessage() }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>

    @if (paginated()) {
      <div class="bk-data-table__footer">
        <bk-pagination
          [totalItems]="filteredData().length"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChanged)="currentPage.set($event)"
          (pageSizeChanged)="onPageSizeChange($event)"
        />
      </div>
    }
  `,
  styles: `
    .bk-data-table__filters {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .bk-data-table__filters:empty {
      display: none;
    }

    .bk-data-table {
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #E2E8F0);
      border-radius: var(--bk-border-radius-lg, 12px);
      overflow: hidden;
    }

    .bk-data-table__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      gap: 12px;
      border-bottom: 1px solid var(--bk-border-color-default, #E2E8F0);
    }

    .bk-data-table__toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bk-data-table__toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 200px;
      max-width: 280px;
    }

    .bk-data-table__wrapper {
      overflow-x: auto;
    }

    .bk-data-table__table {
      width: 100%;
      border-collapse: collapse;
    }

    .bk-data-table__th {
      padding: 10px 16px;
      font-size: var(--bk-font-size-xs, 11px);
      font-weight: 600;
      color: var(--bk-color-text-muted, #64748B);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: left;
      background: color-mix(in srgb, var(--bk-border-color-default, #E2E8F0) 30%, transparent);
      border-bottom: 1px solid var(--bk-border-color-default, #E2E8F0);
      white-space: nowrap;
      user-select: none;
    }

    .bk-data-table__th--sortable {
      cursor: pointer;
      transition: color 0.15s;
    }

    .bk-data-table__th--sortable:hover {
      color: var(--bk-color-text-primary, #0F172A);
    }

    .bk-data-table__th--actions {
      width: 100px;
      text-align: center;
    }

    .bk-data-table__sort-icon {
      margin-left: 4px;
      font-size: 12px;
      color: var(--bk-color-primary, #2563EB);
    }

    .bk-data-table__tr {
      border-bottom: 1px solid var(--bk-border-color-default, #E2E8F0);
      transition: background-color 0.15s;
    }

    .bk-data-table__tr:last-child .bk-data-table__td {
      border-bottom: none;
    }

    .bk-data-table__tr:hover {
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 3%, transparent);
    }

    .bk-data-table__td {
      padding: 12px 16px;
      font-size: var(--bk-font-size-sm, 13px);
      color: var(--bk-color-text-primary, #0F172A);
      vertical-align: middle;
    }

    .bk-data-table__td--actions {
      text-align: center;
    }

    .bk-data-table__action-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .bk-data-table__empty {
      padding: 40px 16px;
      text-align: center;
      font-size: var(--bk-font-size-sm, 13px);
      color: var(--bk-color-text-muted, #94A3B8);
    }

    .bk-data-table__footer {
      padding: 8px 4px 0;
    }
  `,
})
export class BkDataTableComponent {
  readonly data = input<Record<string, any>[]>([]);
  readonly columns = input<DataTableColumn[]>([]);
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly emptyMessage = input<string>('No hay datos disponibles');
  readonly paginated = input<boolean>(true);
  readonly showToolbar = input<boolean>(true);
  readonly filterPosition = input<'left' | 'right'>('left');
  readonly showActions = input<boolean>(true);
  readonly showEditAction = input<boolean>(true);
  readonly showDeleteAction = input<boolean>(true);
  readonly showScheduleAction = input<boolean>(false);
  readonly showStagesAction = input<boolean>(false);
  readonly showPortfolioAction = input<boolean>(false);
  readonly trackByKey = input<string>('id');

  readonly editClicked = output<Record<string, any>>();
  readonly deleteClicked = output<Record<string, any>>();
  readonly scheduleClicked = output<Record<string, any>>();
  readonly stagesClicked = output<Record<string, any>>();
  readonly portfolioClicked = output<Record<string, any>>();

  @ContentChild('rowActions') rowActionsTemplate?: TemplateRef<{ $implicit: any }>;

  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly sortKey = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly filteredData = computed(() => {
    let result = [...this.data()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(row =>
        this.columns().some(col =>
          String(this.resolveValue(row, col.key) ?? '').toLowerCase().includes(term)
        )
      );
    }

    const key = this.sortKey();
    if (key) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const va = this.resolveValue(a, key) ?? '';
        const vb = this.resolveValue(b, key) ?? '';
        return va > vb ? dir : va < vb ? -dir : 0;
      });
    }

    return result;
  });

  readonly pagedData = computed(() => {
    if (!this.paginated()) return this.filteredData();
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  resolveValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row) ?? '';
  }

  trackId(index: number, row: Record<string, any>): string | number {
    const key = this.trackByKey();
    if (key) {
      const val = row[key];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    return index;
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}
