import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';

export interface BkTabItem {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'bk-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-tabs" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="bk-tabs__tab"
          [class.bk-tabs__tab--active]="activeTab() === tab.id"
          [attr.aria-selected]="activeTab() === tab.id"
          (click)="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      }
      <div class="bk-tabs__indicator" [style]="indicatorStyle()"></div>
    </div>
  `,
  styles: `
    .bk-tabs {
      display: flex;
      position: relative;
      border-bottom: 1px solid var(--bk-border-color-default, #E2E8F0);
      gap: 0;
    }

    .bk-tabs__tab {
      position: relative;
      padding: 10px 16px;
      border: none;
      background: transparent;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 12px);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748B);
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease;
      white-space: nowrap;
      z-index: 1;
    }

    .bk-tabs__tab:hover {
      color: var(--bk-color-primary, #2563EB);
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 5%, transparent);
    }

    .bk-tabs__tab--active {
      color: var(--bk-color-primary, #2563EB);
      font-weight: 600;
      background: color-mix(in srgb, var(--bk-color-primary, #2563EB) 5%, transparent);
    }

    .bk-tabs__tab--active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--bk-color-primary, #2563EB);
      border-radius: 2px 2px 0 0;
    }

    .bk-tabs__indicator {
      display: none;
    }
  `,
})
export class BkTabsComponent {
  readonly tabs = input.required<BkTabItem[]>();
  readonly activeTab = input<string>('');
  readonly tabChange = output<string>();

  indicatorStyle = computed(() => '');

  selectTab(id: string): void {
    this.tabChange.emit(id);
  }
}
