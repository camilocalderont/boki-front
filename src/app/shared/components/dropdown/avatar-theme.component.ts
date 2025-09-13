import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'avatar-theme',
  template: `
    <div [class]="avatarClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class AvatarThemeComponent extends BaseComponent {
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get avatarClasses(): string {
    const sizeClasses = this.size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    
    return [
      // Clases base del avatar
      sizeClasses,
      'rounded-full flex items-center justify-center shadow-sm',
      // Background gradient - light y dark
      this.theme?.theme?.colors?.avatar?.background?.light || 'bg-gradient-to-r from-blue-500 to-blue-600',
      this.theme?.theme?.colors?.avatar?.background?.dark || 'dark:from-blue-600 dark:to-blue-700',
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}