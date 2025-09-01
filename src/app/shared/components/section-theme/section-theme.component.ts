import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'section-theme',
  template: `
    <section [class]="cssClasses">
      <ng-content></ng-content>
    </section>
  `,
  standalone: true
})
export class SectionThemeComponent extends BaseComponent {
  @Input() class: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get cssClasses(): string {
    const themeClasses = [
      this.theme?.theme?.colors?.background?.secondary?.light || '',
      this.theme?.theme?.colors?.shadow?.md?.light || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  protected onComponentInit(): void {
    // Forzar detección de cambios después de que el tema esté disponible
    this.cdr.detectChanges();
  }
}
