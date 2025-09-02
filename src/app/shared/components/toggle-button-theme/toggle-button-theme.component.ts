import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'toggle-button-theme',
  template: `
    <button [class]="buttonClasses" (click)="toggle.emit()">
      <svg [class]="iconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          [attr.d]="isCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'">
        </path>
      </svg>
    </button>
  `,
  standalone: true
})
export class ToggleButtonThemeComponent extends BaseComponent {
  @Input() isCollapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get buttonClasses(): string {
    return [
      'p-2.5 rounded-xl transition-all duration-200 group',
      this.theme?.theme?.colors?.background?.hoverSecondary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get iconClasses(): string {
    return [
      'w-5 h-5',
      this.theme?.theme?.colors?.text?.tertiary?.light || '',
      this.theme?.theme?.colors?.text?.hoverSecondary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}