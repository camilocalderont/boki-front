import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'sidebar-theme',
  template: `
    <div [class]="sidebarClasses" [class.w-72]="!isCollapsed" [class.w-20]="isCollapsed">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class SidebarThemeComponent extends BaseComponent {
  @Input() isCollapsed: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get sidebarClasses(): string {
    return [
      'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r',
      this.theme?.theme?.colors?.background?.secondary?.light || '',
      this.theme?.theme?.colors?.border?.primary?.light || '',
      this.theme?.theme?.colors?.shadow?.primary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}