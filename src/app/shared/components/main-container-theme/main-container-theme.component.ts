import { Component, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'main-container-theme',
  template: `
    <div class="{{containerClassesString}}" #containerDiv>
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class MainContainerThemeComponent extends BaseComponent implements OnInit {

  // Variable para las clases - se construye UNA sola vez
  public containerClassesString: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.buildClasses();
  }


  private buildClasses(): void {
    // Container classes - incluye light y dark
    this.containerClassesString = [
      'min-h-screen flex',
      // Background primary - incluye light y dark
      this.theme?.theme?.colors?.background?.primary?.light || 'bg-gray-50',
      this.theme?.theme?.colors?.background?.secondary?.dark || 'dark:bg-gray-900' 
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