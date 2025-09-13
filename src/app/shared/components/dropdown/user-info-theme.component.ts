import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'user-info-theme',
  template: `
    <div class="flex-1 min-w-0">
      <div class="flex items-center space-x-2 mb-1">
        <p [class]="nameClasses">
          <ng-content select="[slot=name]"></ng-content>
        </p>
        <span [class]="badgeClasses">
          <ng-content select="[slot=badge]"></ng-content>
        </span>
      </div>
      <p [class]="emailClasses">
        <ng-content select="[slot=email]"></ng-content>
      </p>
    </div>
  `,
  standalone: true
})
export class UserInfoThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get nameClasses(): string {
    return [
      'text-sm font-semibold truncate',
      // Text primary - usando text.primary del tema
      this.theme?.theme?.colors?.text?.primary?.light || '',
      this.theme?.theme?.colors?.text?.primary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get badgeClasses(): string {
    return [
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      // Brand colors para el badge Pro
      this.theme?.theme?.colors?.brand?.primary?.light || '',
      this.theme?.theme?.colors?.brand?.primary?.dark || '',
      this.theme?.theme?.colors?.text?.white?.light || '',
      this.theme?.theme?.colors?.text?.white?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get emailClasses(): string {
    return [
      'text-xs truncate',
      // Text quaternary - usando text.quaternary del tema
      this.theme?.theme?.colors?.text?.quaternary?.light || '',
      this.theme?.theme?.colors?.text?.quaternary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}