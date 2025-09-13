import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'separator-theme',
  template: `
    <div [class]="separatorClasses">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class SeparatorThemeComponent extends BaseComponent {
  @Input() additionalClasses: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  get separatorClasses(): string {
    return [
      'border-t',
      // Border secondary - usando border.secondary del tema
      this.theme?.theme?.colors?.border?.secondary?.light || '',
      this.theme?.theme?.colors?.border?.secondary?.dark || '',
      this.additionalClasses
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}