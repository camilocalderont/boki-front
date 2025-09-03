import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'h1-theme',
  template: `
    <h1 [class]="cssClasses">
      <ng-content></ng-content>
    </h1>
  `,
  standalone: true
})
export class H1ThemeComponent extends BaseComponent {
  @Input() class: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get cssClasses(): string {
    const themeClasses = [
      'text-2xl font-bold',
      this.theme?.theme?.colors?.text?.primary?.light || 'text-gray-900',
      this.theme?.theme?.colors?.text?.primary?.dark || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}