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
      this.theme?.theme?.colors?.border?.primary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedContainerClasses(): string {
    return [
      'border-t px-2 py-3 flex justify-center',
      this.theme?.theme?.colors?.border?.primary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get linkClasses(): string {
    return [
      'flex items-center px-3 py-2 rounded-lg transition-all duration-200 group',
      this.theme?.theme?.colors?.background?.hover?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get logoClasses(): string {
    return [
      'w-6 h-6 rounded-lg flex items-center justify-center mr-2',
      this.theme?.theme?.colors?.brand?.gradient?.light || '',
      this.theme?.theme?.colors?.shadow?.small?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get logoTextClasses(): string {
    return [
      'font-bold text-xs',
      this.theme?.theme?.colors?.text?.white?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get textClasses(): string {
    return [
      'text-xs font-medium transition-colors duration-200',
      this.theme?.theme?.colors?.text?.quaternary?.light || '',
      this.theme?.theme?.colors?.brand?.textHover?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedLinkClasses(): string {
    return [
      'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group',
      this.theme?.theme?.colors?.brand?.gradient?.light || '',
      this.theme?.theme?.colors?.shadow?.small?.light || '',
      this.theme?.theme?.colors?.shadow?.hover?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get collapsedLogoTextClasses(): string {
    return [
      'font-bold text-sm group-hover:scale-110 transition-transform duration-200',
      this.theme?.theme?.colors?.text?.white?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}