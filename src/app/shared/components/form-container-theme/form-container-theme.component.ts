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
      this.theme?.theme?.colors?.background?.secondary?.light || '',
      this.theme?.theme?.colors?.shadow?.md?.light || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}