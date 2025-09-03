import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'h2-theme',
  template: `
    <h2 [class]="cssClasses">
      <ng-content></ng-content>
    </h2>
  `,
  standalone: true
})
export class H2ThemeComponent extends BaseComponent {
  @Input() class: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get cssClasses(): string {
    const themeClasses = [
      'text-2xl font-bold mb-2',
      // Text primary - incluye light y dark
      this.theme?.theme?.colors?.text?.primary?.light || 'text-gray-900',
      this.theme?.theme?.colors?.text?.primary?.dark || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    // Forzar detección de cambios después de que el tema esté disponible
    this.cdr.detectChanges();
  }
}