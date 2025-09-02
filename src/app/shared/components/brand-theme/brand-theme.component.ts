import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'brand-theme',
  template: `
    <div class="flex items-center">
      <div class="{{logoClassesString}}">
        <span class="{{logoTextClassesString}}">B</span>
      </div>
      <div class="flex flex-col">
        <span class="{{titleClassesString}}">BokiBot</span>
        <span class="{{subtitleClassesString}}">Dashboard</span>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class BrandThemeComponent extends BaseComponent implements OnInit {

  // Variables para las clases - se construyen UNA sola vez
  public logoClassesString: string = '';
  public logoTextClassesString: string = '';
  public titleClassesString: string = '';
  public subtitleClassesString: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.buildClasses();
  }

  private buildClasses(): void {
    // Logo classes
    this.logoClassesString = [
      'w-10 h-10 rounded-xl flex items-center justify-center mr-4',
      this.theme?.theme?.colors?.brand?.gradient?.light || 'bg-gradient-to-r from-brand-blue to-brand-blue-light'
    ].filter(cls => cls && cls.trim()).join(' ');

    // Logo text classes  
    this.logoTextClassesString = [
      'font-bold text-lg',
      this.theme?.theme?.colors?.text?.white?.light || 'text-white'
    ].filter(cls => cls && cls.trim()).join(' ');

    // Title classes
    this.titleClassesString = [
      'font-bold text-xl', 
      this.theme?.theme?.colors?.text?.primary?.light || 'text-gray-900'
    ].filter(cls => cls && cls.trim()).join(' ');

    // Subtitle classes
    this.subtitleClassesString = [
      'text-xs font-medium',
      this.theme?.theme?.colors?.text?.quaternary?.light || 'text-gray-600'
    ].filter(cls => cls && cls.trim()).join(' ');

    this.cdr.detectChanges();
  }

  public refreshTheme(): void {
    this.buildClasses();
  }

  protected onComponentInit(): void {
    this.buildClasses();
  }
}