import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'toggle-button-theme',
  template: `
    <button [class]="buttonClasses" (click)="toggle.emit()">
      <div [class]="iconContainerClasses">
        <svg [class]="iconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            [attr.d]="isCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'">
          </path>
        </svg>
      </div>
    </button>
  `,
  standalone: true
})
export class ToggleButtonThemeComponent extends BaseComponent {
  @Input() isCollapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get buttonClasses(): string {
    return [
      // Estructura base del botón - más circular y elegante
      'relative overflow-hidden rounded-2xl transition-all duration-300 ease-out',
      'transform active:scale-95 focus:outline-none focus:ring-0',
      
      // Tamaño y padding
      'w-11 h-11 flex items-center justify-center',
      
      // Background principal
      this.theme?.theme?.colors?.background?.secondary?.light || 'bg-white',
      this.theme?.theme?.colors?.background?.secondary?.dark || 'dark:bg-gray-800',
      
      // Hover background - más suave y elegante
      'hover:bg-gray-100 dark:hover:bg-gray-700',
      
      // Sombra sutil
      this.theme?.theme?.colors?.shadow?.sm?.light || 'shadow-sm',
      this.theme?.theme?.colors?.shadow?.hover?.light || 'hover:shadow-md',
      'dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-black/20',
      
      // Border sutil
      this.theme?.theme?.colors?.border?.secondary?.light || 'border border-gray-200',
      this.theme?.theme?.colors?.border?.secondary?.dark || 'dark:border-gray-600',
      'hover:border-gray-300 dark:hover:border-gray-500',
      
      // Estados especiales
      'group cursor-pointer'
    ].filter(cls => cls).join(' ');
  }

  get iconContainerClasses(): string {
    return [
      // Contenedor del icono con animaciones suaves
      'relative flex items-center justify-center',
      'transition-transform duration-300 ease-out',
      'group-hover:scale-110 group-active:scale-95'
    ].join(' ');
  }

  get iconClasses(): string {
    return [
      // Tamaño del icono
      'w-5 h-5',
      
      // Colores principales
      this.theme?.theme?.colors?.text?.secondary?.light || 'text-gray-700',
      this.theme?.theme?.colors?.text?.secondary?.dark || 'dark:text-gray-300',
      
      // Hover colors - más contrastados y elegantes
      'group-hover:text-gray-900 dark:group-hover:text-white',
      
      // Transiciones suaves
      'transition-all duration-300 ease-out',
      
      // Efecto de rotación sutil en hover
      'group-hover:rotate-3',
      
      // Cuando está colapsado, diferente rotación
      this.isCollapsed ? 'rotate-0' : 'rotate-45 group-hover:rotate-48'
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}