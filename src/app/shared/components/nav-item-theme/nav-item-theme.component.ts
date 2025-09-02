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
      <span *ngIf="showLabel" class="font-semibold">
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
      return [
        baseClasses,
        'bg-brand-blue text-white shadow-lg'
      ].join(' ');
    }
    
    return [
      baseClasses,
      'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    ].join(' ');
  }

  get activeIndicatorClasses(): string {
    return [
      'absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full',
      this.theme?.theme?.colors?.text?.white?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get iconContainerClasses(): string {
    return [
      'w-6 h-6 mr-4 flex-shrink-0 flex items-center justify-center',
      this.active 
        ? this.theme?.theme?.colors?.text?.white?.light || ''
        : `${this.theme?.theme?.colors?.text?.tertiary?.light || ''} ${this.theme?.theme?.colors?.brand?.textHover?.light || ''}`
    ].filter(cls => cls).join(' ');
  }

  onClick(): void {
    this.itemClick.emit();
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}