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
        // Primary button background - light y dark
        this.theme?.theme?.colors?.buttons?.primary?.background?.light || 'bg-brand-blue',
        this.theme?.theme?.colors?.buttons?.primary?.background?.dark || '',
        // Primary button text - light y dark
        this.theme?.theme?.colors?.buttons?.primary?.text?.light || 'text-white',
        this.theme?.theme?.colors?.buttons?.primary?.text?.dark || '',
        // Primary button hover - light y dark
        this.theme?.theme?.colors?.buttons?.primary?.backgroundHover?.light || 'hover:bg-brand-blue-dark',
        this.theme?.theme?.colors?.buttons?.primary?.backgroundHover?.dark || '',
        // Focus ring blue - light y dark
        this.theme?.theme?.colors?.focus?.ring?.blue?.light || 'focus:ring-4 focus:ring-blue-200',
        this.theme?.theme?.colors?.focus?.ring?.blue?.dark || ''
      ].filter(cls => cls).join(' ');
    } else {
      variantClasses = [
        // Secondary button background - light y dark
        this.theme?.theme?.colors?.buttons?.secondary?.background?.light || 'bg-gray-200',
        this.theme?.theme?.colors?.buttons?.secondary?.background?.dark || '',
        // Secondary button text - light y dark
        this.theme?.theme?.colors?.buttons?.secondary?.text?.light || 'text-black',
        this.theme?.theme?.colors?.buttons?.secondary?.text?.dark || '',
        // Secondary button hover - light y dark
        this.theme?.theme?.colors?.buttons?.secondary?.backgroundHover?.light || 'hover:bg-gray-300',
        this.theme?.theme?.colors?.buttons?.secondary?.backgroundHover?.dark || '',
        // Focus ring secondary - light y dark
        this.theme?.theme?.colors?.focus?.ring?.secondary?.light || 'focus:ring-4 focus:ring-gray-200',
        this.theme?.theme?.colors?.focus?.ring?.secondary?.dark || ''
      ].filter(cls => cls).join(' ');
    }

    const shadowClasses = [
      // Shadow sm - light y dark
      this.theme?.theme?.colors?.shadow?.sm?.light || 'shadow-sm',
      this.theme?.theme?.colors?.shadow?.sm?.dark || '',
      // Shadow hover - light y dark
      this.theme?.theme?.colors?.shadow?.hover?.light || 'hover:shadow-md',
      this.theme?.theme?.colors?.shadow?.hover?.dark || ''
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