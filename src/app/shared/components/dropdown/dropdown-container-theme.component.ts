import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'dropdown-container-theme',
  template: `
    <div [class]="containerClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class DropdownContainerThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get containerClasses(): string {
    return [
      // Clases base del dropdown
      'absolute right-0 top-full mt-1 w-64 rounded-xl shadow-lg border overflow-hidden z-50 opacity-0 translate-y-1 transition-all duration-150',
      
      // Background - usando secondary del tema
      this.theme?.theme?.colors?.background?.secondary?.light || '',
      this.theme?.theme?.colors?.background?.secondary?.dark || '',
      
      // Border - usando primary del tema  
      this.theme?.theme?.colors?.border?.primary?.light || '',
      this.theme?.theme?.colors?.border?.primary?.dark || '',
      
      // Shadow - usando lg del tema
      this.theme?.theme?.colors?.shadow?.lg?.light || '',
      this.theme?.theme?.colors?.shadow?.lg?.dark || '',
      
      // Clases adicionales
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}