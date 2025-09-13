import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'avatar-button-theme',
  template: `
    <button [class]="buttonClasses">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class AvatarButtonThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get buttonClasses(): string {
    return [
      'flex items-center space-x-2 p-1.5 rounded-lg transition-all duration-200 group',
      // Hover background - usando buttons.ghost.backgroundHover del tema
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || '',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || '',
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}