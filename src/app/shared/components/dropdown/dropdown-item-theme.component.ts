import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'dropdown-item-theme',
  template: `
    <button [class]="itemClasses">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class DropdownItemThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';
  @Input() isLogout: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get itemClasses(): string {
    const baseClasses = 'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150';
    
    if (this.isLogout) {
      return [
        baseClasses,
        // Logout text colors - usando status.error del tema
        this.theme?.theme?.colors?.status?.error?.text?.light || '',
        this.theme?.theme?.colors?.status?.error?.text?.dark || '',
        // Logout hover - usando ghost hover (lo que hay disponible)
        this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || '',
        this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || '',
        this.additionalClasses
      ].filter(cls => cls).join(' ');
    }
    
    return [
      baseClasses,
      // Normal item text colors - usando buttons.ghost.text del tema
      this.theme?.theme?.colors?.buttons?.ghost?.text?.light || '',
      // Hardcodeado temporalmente para que se vea negro en dark mode
      'dark:text-gray-900',
      // Normal item hover background - usando buttons.ghost.backgroundHover del tema
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.light || '',
      this.theme?.theme?.colors?.buttons?.ghost?.backgroundHover?.dark || '',
      // Text hover - para que en dark mode el texto pase a blanco en hover
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.light || '',
      this.theme?.theme?.colors?.buttons?.ghost?.textHover?.dark || '',
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}