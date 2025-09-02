import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'header-theme',
  template: `
    <header [class]="headerClasses">
      <ng-content></ng-content>
    </header>
  `,
  standalone: true
})
export class HeaderThemeComponent extends BaseComponent {

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get headerClasses(): string {
    return [
      'backdrop-blur-sm border-b px-8 py-4 sticky top-0 z-40',
      this.theme?.theme?.colors?.background?.blur?.light || '',
      this.theme?.theme?.colors?.border?.primary?.light || '',
      this.theme?.theme?.colors?.shadow?.secondary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}