import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'solercia-credit-theme',
  template: `
    <!-- Versión expandida -->
    <div [class]="expandedContainerClasses" *ngIf="!isCollapsed">
      <div class="flex items-center justify-center">
        <a href="https://solercia.com" target="_blank" [class]="linkClasses">
          <div [class]="logoClasses">
            <span [class]="logoTextClasses">S</span>
          </div>
          <span [class]="textClasses">
            @by solercia
          </span>
        </a>
      </div>
    </div>

    <!-- Versión colapsada -->
    <div [class]="collapsedContainerClasses" *ngIf="isCollapsed">
      <a href="https://solercia.com" target="_blank"
        [class]="collapsedLinkClasses"
        title="Desarrollado por Solercia">
        <span [class]="collapsedLogoTextClasses">S</span>
      </a>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SolerciaCreditThemeComponent extends BaseComponent {
  @Input() isCollapsed: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get expandedContainerClasses(): string {
    return [
      'border-t px-4 py-3',
      this.theme?.theme?.colors?.border?.primary?.light || 'border-gray-100',
      this.theme?.theme?.colors?.border?.primary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedContainerClasses(): string {
    return [
      'border-t px-2 py-3 flex justify-center',
      this.theme?.theme?.colors?.border?.primary?.light || 'border-gray-100',
      this.theme?.theme?.colors?.border?.primary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get linkClasses(): string {
    return [
      'flex items-center px-3 py-2 rounded-lg transition-all duration-200 group',
      // Corregido: usando ghost button hover que sí existe en el JSON
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || 'hover:bg-gray-50',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get logoClasses(): string {
    return [
      'w-6 h-6 rounded-lg flex items-center justify-center mr-2',
      this.theme?.theme?.colors?.brand?.gradient?.light || 'bg-gradient-to-r from-brand-blue to-brand-blue-light',
      this.theme?.theme?.colors?.brand?.gradient?.dark || '',
      // Corregido: usando shadow.sm que sí existe en el JSON
      this.theme?.theme?.colors?.shadow?.sm?.light || 'shadow-sm',
      this.theme?.theme?.colors?.shadow?.sm?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get logoTextClasses(): string {
    return [
      'font-bold text-xs',
      this.theme?.theme?.colors?.text?.white?.light || 'text-white',
      this.theme?.theme?.colors?.text?.white?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get textClasses(): string {
    return [
      'text-xs font-medium transition-colors duration-200',
      this.theme?.theme?.colors?.text?.quaternary?.light || 'text-gray-500',
      this.theme?.theme?.colors?.text?.quaternary?.dark || '',
      this.theme?.theme?.colors?.brand?.textHover?.light || 'hover:text-brand-blue',
      this.theme?.theme?.colors?.brand?.textHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedLinkClasses(): string {
    return [
      'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group',
      this.theme?.theme?.colors?.brand?.gradient?.light || 'bg-gradient-to-r from-brand-blue to-brand-blue-light',
      this.theme?.theme?.colors?.brand?.gradient?.dark || '',
      // Corregido: usando shadow.sm que sí existe
      this.theme?.theme?.colors?.shadow?.sm?.light || 'shadow-sm',
      this.theme?.theme?.colors?.shadow?.sm?.dark || '',
      this.theme?.theme?.colors?.shadow?.hover?.light || 'hover:shadow-md',
      this.theme?.theme?.colors?.shadow?.hover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedLogoTextClasses(): string {
    return [
      'font-bold text-sm group-hover:scale-110 transition-transform duration-200',
      this.theme?.theme?.colors?.text?.white?.light || 'text-white',
      this.theme?.theme?.colors?.text?.white?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}