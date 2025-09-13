import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'dropdown-header-theme',
  template: `
    <div [class]="headerClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class DropdownHeaderThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get headerClasses(): string {
    return [
      // Clases base del header
      'px-4 py-4 border-b',
      // Border - usando border.secondary del tema
      this.theme?.theme?.colors?.border?.secondary?.light || '',
      this.theme?.theme?.colors?.border?.secondary?.dark || '',
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}