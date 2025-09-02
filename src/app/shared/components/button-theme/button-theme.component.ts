import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'button-theme',
  template: `
    <button [class]="cssClasses" [type]="type" [disabled]="disabled" (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class ButtonThemeComponent extends BaseComponent {
  @Input() class: string = '';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Output() click = new EventEmitter<Event>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get cssClasses(): string {
    const baseClasses = 'px-5 py-2.5 inline-flex items-center text-sm rounded-md transition-all duration-200';
    
    let variantClasses = '';
    if (this.variant === 'primary') {
      variantClasses = [
        this.theme?.theme?.colors?.buttons?.primary?.background?.light || '',
        this.theme?.theme?.colors?.buttons?.primary?.text?.light || '',
        this.theme?.theme?.colors?.buttons?.primary?.backgroundHover?.light || '',
        this.theme?.theme?.colors?.focus?.ring?.blue?.light || ''
      ].filter(cls => cls).join(' ');
    } else {
      variantClasses = [
        this.theme?.theme?.colors?.buttons?.secondary?.background?.light || '',
        this.theme?.theme?.colors?.buttons?.secondary?.text?.light || '',
        this.theme?.theme?.colors?.buttons?.secondary?.backgroundHover?.light || '',
        this.theme?.theme?.colors?.focus?.ring?.secondary?.light || ''
      ].filter(cls => cls).join(' ');
    }

    const shadowClasses = [
      this.theme?.theme?.colors?.shadow?.sm?.light || '',
      this.theme?.theme?.colors?.shadow?.hover?.light || ''
    ].filter(cls => cls).join(' ');

    const disabledClasses = this.disabled ? 'disabled:opacity-50 disabled:cursor-not-allowed' : '';

    return `${baseClasses} ${variantClasses} ${shadowClasses} ${disabledClasses} ${this.class}`.trim();
  }

  onClick(event: Event): void {
    if (!this.disabled) {
      this.click.emit(event);
    }
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}