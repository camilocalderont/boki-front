import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'form-container-theme',
  template: `
    <div [class]="containerClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class FormContainerThemeComponent extends BaseComponent {
  @Input() class: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get containerClasses(): string {
    const themeClasses = [
      'max-w-8xl mx-auto p-6 rounded-2xl',
      // Background secondary - incluye light y dark
      this.theme?.theme?.colors?.background?.secondary?.light || 'bg-white',
      this.theme?.theme?.colors?.background?.secondary?.dark || '',
      // Shadow md - incluye light y dark
      this.theme?.theme?.colors?.shadow?.md?.light || 'shadow-md',
      this.theme?.theme?.colors?.shadow?.md?.dark || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}