import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="flex space-x-4" role="tablist">
        <button *ngFor="let tab of tabs"
          (click)="selectTab(tab.id)"
          [class]="tab.id === activeTab
            ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300'"
          role="tab">
          {{ tab.label }}
        </button>
      </nav>
    </div>
  `
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    this.activeTab = tabId;
    this.tabChange.emit(tabId);
  }
}
