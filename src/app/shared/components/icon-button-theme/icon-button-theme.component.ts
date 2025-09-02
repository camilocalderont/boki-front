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
      this.theme?.theme?.colors?.background?.hover?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get badgeClasses(): string {
    return [
      'absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center',
      this.theme?.theme?.colors?.notifications?.badge?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get dotClasses(): string {
    return [
      'w-2 h-2 rounded-full',
      this.theme?.theme?.colors?.notifications?.dot?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}