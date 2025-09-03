import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'header-theme',
  template: `
    <header class="{{headerClassesString}}">
      <ng-content></ng-content>
    </header>
  `,
  standalone: true
})
export class HeaderThemeComponent extends BaseComponent implements OnInit {

  // Variable para las clases - se construye UNA sola vez
  public headerClassesString: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.buildClasses();
    console.log('Header classes:', this.headerClassesString);
  }

  private buildClasses(): void {
    this.headerClassesString = [
      'backdrop-blur-sm border-b-2 px-8 py-4 sticky top-0 z-40',
      // Background blur - usando JSON
      this.theme?.theme?.colors?.background?.primary?.light || 'bg-white/80',
      this.theme?.theme?.colors?.background?.primary?.dark || '',
      // Border - usando JSON (ahora dark:border-gray-400 más visible)
      this.theme?.theme?.colors?.border?.primary?.light || 'border-gray-100',
      this.theme?.theme?.colors?.border?.primary?.dark || '',
      // Shadow - usando JSON
      this.theme?.theme?.colors?.shadow?.sm?.light || 'shadow-sm',
      this.theme?.theme?.colors?.shadow?.sm?.dark || ''
    ].filter(cls => cls && cls.trim()).join(' ');

    console.log('Built header classes:', this.headerClassesString);
    this.cdr.detectChanges();
  }

  public refreshTheme(): void {
    this.buildClasses();
  }

  protected onComponentInit(): void {
    this.buildClasses();
  }
}