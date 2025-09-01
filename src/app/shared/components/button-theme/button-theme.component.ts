import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'button-theme',
  template: `
    <button [class]="cssClasses" (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class ButtonThemeComponent extends BaseComponent {
  @Input() class: string = '';
  @Output() click = new EventEmitter<Event>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get cssClasses(): string {
    const themeClasses = [
      'inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
      this.theme?.theme?.colors?.buttons?.primary?.background?.light || '',
      this.theme?.theme?.colors?.buttons?.primary?.text?.light || '',
      this.theme?.theme?.colors?.buttons?.primary?.backgroundHover?.light || '',
      this.theme?.theme?.colors?.focus?.ring?.blue?.light || '',
      this.theme?.theme?.colors?.shadow?.sm?.light || '',
      this.theme?.theme?.colors?.shadow?.hover?.light || ''
    ].filter(cls => cls).join(' ');

    return `${themeClasses} ${this.class}`.trim();
  }

  onClick(event: Event): void {
    this.click.emit(event);
  }

  protected onComponentInit(): void {
    // Forzar detección de cambios después de que el tema esté disponible
    this.cdr.detectChanges();
  }
}
