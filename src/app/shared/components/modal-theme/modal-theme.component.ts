import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'modal-theme',
  template: `
    <div [class]="modalClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class ModalThemeComponent extends BaseComponent {
  @Input() contentClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get modalClasses(): string {
    return [
      // Clases base del modal
      'rounded-lg shadow-lg p-6 w-full max-w-xl transition-all duration-300',
      // Background - incluye tanto light como dark
      this.theme?.theme?.colors?.background?.primary?.light || 'bg-white',
      this.theme?.theme?.colors?.background?.primary?.dark || 'dark:bg-gray-800',
      // Text color - incluye tanto light como dark
      this.theme?.theme?.colors?.text?.primary?.light || 'text-gray-800',
      this.theme?.theme?.colors?.text?.primary?.dark || 'dark:text-white',
      // Border si existe
      this.theme?.theme?.colors?.border?.primary?.light || '',
      this.theme?.theme?.colors?.border?.primary?.dark || '',
      // Shadow
      this.theme?.theme?.colors?.shadow?.lg?.light || '',
      this.theme?.theme?.colors?.shadow?.lg?.dark || '',
      // Clases adicionales pasadas por parámetro
      this.contentClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}