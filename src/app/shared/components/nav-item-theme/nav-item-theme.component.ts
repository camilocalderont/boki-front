import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'nav-item-theme',
  template: `
    <a [routerLink]="route" [class]="navItemClasses" (click)="onClick()">
      <div *ngIf="active" [class]="activeIndicatorClasses"></div>
      <div [class]="iconContainerClasses">
        <ng-content select="[slot=icon]"></ng-content>
      </div>
      <span *ngIf="showLabel" [class]="labelClasses">
        <ng-content></ng-content>
      </span>
    </a>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavItemThemeComponent extends BaseComponent {
  @Input() route: string = '';
  @Input() active: boolean = false;
  @Input() showLabel: boolean = true;
  @Output() itemClick = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get navItemClasses(): string {
    const baseClasses = 'flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative';
    
    if (this.active) {
      // Estado activo - usando primary button del JSON
      return [
        baseClasses,
        this.theme?.theme?.colors?.buttons?.primary?.background?.light || 'bg-brand-blue',
        this.theme?.theme?.colors?.buttons?.primary?.background?.dark || '',
        this.theme?.theme?.colors?.buttons?.primary?.text?.light || 'text-white',
        this.theme?.theme?.colors?.buttons?.primary?.text?.dark || '',
        this.theme?.theme?.colors?.shadow?.lg?.light || 'shadow-lg',
        this.theme?.theme?.colors?.shadow?.lg?.dark || ''
      ].filter(cls => cls).join(' ');
    }
    
    // Estado no activo - usando ghost button del JSON
    return [
      baseClasses,
      this.theme?.theme?.colors?.buttons?.ghost?.text?.light || 'text-gray-700',
      this.theme?.theme?.colors?.buttons?.ghost?.text?.dark || '',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || 'hover:bg-gray-50',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || '',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.light || 'hover:text-gray-900',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get activeIndicatorClasses(): string {
    return [
      'absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full',
      // Usando primary button text para el indicador activo
      this.theme?.theme?.colors?.buttons?.primary?.text?.light || 'text-white',
      this.theme?.theme?.colors?.buttons?.primary?.text?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get iconContainerClasses(): string {
    const baseClasses = 'w-6 h-6 mr-4 flex-shrink-0 flex items-center justify-center';
    
    if (this.active) {
      // Icono cuando está activo - blanco
      return [
        baseClasses,
        this.theme?.theme?.colors?.buttons?.primary?.text?.light || 'text-white',
        this.theme?.theme?.colors?.buttons?.primary?.text?.dark || ''
      ].filter(cls => cls).join(' ');
    }
    
    // Icono cuando no está activo - ghost button style
    return [
      baseClasses,
      this.theme?.theme?.colors?.buttons?.ghost?.text?.light || 'text-gray-700',
      this.theme?.theme?.colors?.buttons?.ghost?.text?.dark || '',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.light || 'hover:text-gray-900',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get labelClasses(): string {
    // Clases para el texto del label
    if (this.active) {
      return [
        'font-semibold',
        this.theme?.theme?.colors?.buttons?.primary?.text?.light || 'text-white',
        this.theme?.theme?.colors?.buttons?.primary?.text?.dark || ''
      ].filter(cls => cls).join(' ');
    }
    
    return [
      'font-semibold',
      this.theme?.theme?.colors?.buttons?.ghost?.text?.light || 'text-gray-700',
      this.theme?.theme?.colors?.buttons?.ghost?.text?.dark || '',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.light || 'hover:text-gray-900',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  onClick(): void {
    this.itemClick.emit();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}