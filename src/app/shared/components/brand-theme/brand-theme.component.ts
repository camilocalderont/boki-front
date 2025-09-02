import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'brand-theme',
  template: `
    <div class="flex items-center">
      <div [class]="logoClasses">
        <span [class]="logoTextClasses">B</span>
      </div>
      <div class="flex flex-col">
        <span [class]="titleClasses">BokiBot</span>
        <span [class]="subtitleClasses">Dashboard</span>
      </div>
    </div>
  `,
  standalone: true
})
export class BrandThemeComponent extends BaseComponent {

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get logoClasses(): string {
    return [
      'w-10 h-10 rounded-xl flex items-center justify-center mr-4',
      this.theme?.theme?.colors?.brand?.gradient?.light || '',
      this.theme?.theme?.colors?.shadow?.navigation?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get logoTextClasses(): string {
    return [
      'font-bold text-lg',
      this.theme?.theme?.colors?.text?.white?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get titleClasses(): string {
    return [
      'font-bold text-xl',
      this.theme?.theme?.colors?.text?.primary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get subtitleClasses(): string {
    return [
      'text-xs font-medium',
      this.theme?.theme?.colors?.text?.quaternary?.light || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}