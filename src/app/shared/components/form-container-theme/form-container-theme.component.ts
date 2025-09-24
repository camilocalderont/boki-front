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
      this.theme?.theme?.colors?.background?.secondary?.light || 'bg-white',
      this.theme?.theme?.colors?.background?.secondary?.dark || '',
      this.theme?.theme?.colors?.border?.secondary?.light || '',
      'dark:border-gray-500',
      'border-2', 
      this.theme?.theme?.colors?.shadow?.md?.light || 'shadow-md',
      'dark:shadow-2xl',
      'dark:shadow-gray-900/50', 
      'dark:ring-1',
      'dark:ring-gray-400/20',
      'backdrop-blur-sm',
      'dark:bg-gray-800/90'
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}