import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'icon-button-theme',
  template: `
    <button [class]="buttonClasses" (click)="buttonClick.emit($event)">
      <ng-content></ng-content>
      <span *ngIf="showBadge" [class]="badgeClasses">
        <span [class]="dotClasses"></span>
      </span>
    </button>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class IconButtonThemeComponent extends BaseComponent {
  @Input() showBadge: boolean = false;
  @Output() buttonClick = new EventEmitter<Event>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get buttonClasses(): string {
    return [
      'p-3 rounded-xl transition-all duration-200 relative group',
      // Corregido: usando ghost button hover que sí existe en el JSON
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || 'hover:bg-gray-50',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get badgeClasses(): string {
    return [
      'absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center',
      // Usando brand primary para el badge (azul)
      this.theme?.theme?.colors?.brand?.primary?.light || 'bg-blue-500',
      this.theme?.theme?.colors?.brand?.primary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get dotClasses(): string {
    return [
      'w-2 h-2 rounded-full',
      // Dot interno blanco para contraste
      'bg-white'
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}