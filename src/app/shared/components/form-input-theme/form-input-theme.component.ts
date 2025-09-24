import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'form-input-theme',
  template: `
    <div>
      <input 
        [type]="type"
        [placeholder]="placeholder"
        [class]="inputClasses"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()" />
      <div *ngIf="showError && errorMessage" [class]="errorClasses">
        {{ errorMessage }}
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputThemeComponent),
      multi: true
    }
  ]
})
export class FormInputThemeComponent extends BaseComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';

  value: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get inputClasses(): string {
    return [
      'w-full rounded-md p-2.5',
      // Border - light y dark
      this.theme?.theme?.colors?.forms?.input?.border?.light || '',
      this.theme?.theme?.colors?.forms?.input?.border?.dark || '',
      // Background - light y dark
      this.theme?.theme?.colors?.forms?.input?.background?.light || '',
      this.theme?.theme?.colors?.forms?.input?.background?.dark || '',
      // Text - light y dark
      this.theme?.theme?.colors?.forms?.input?.text?.light || '',
      this.theme?.theme?.colors?.forms?.input?.text?.dark || '',
      // Placeholder - light y dark
      this.theme?.theme?.colors?.forms?.input?.placeholder?.light || '',
      this.theme?.theme?.colors?.forms?.input?.placeholder?.dark || '',
      // Shadow - light y dark
      this.theme?.theme?.colors?.shadow?.sm?.light || '',
      this.theme?.theme?.colors?.shadow?.sm?.dark || '',
      // Focus ring - light y dark
      this.theme?.theme?.colors?.focus?.ring?.primary?.light || '',
      this.theme?.theme?.colors?.focus?.ring?.primary?.dark || '',
      // Border focus - light y dark
      this.theme?.theme?.colors?.forms?.input?.borderFocus?.light || '',
      this.theme?.theme?.colors?.forms?.input?.borderFocus?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get errorClasses(): string {
    return [
      'text-xs mt-1 pl-1',
      // Error text - light y dark
      this.theme?.theme?.colors?.status?.error?.textLight?.light || '',
      this.theme?.theme?.colors?.status?.error?.textLight?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {}

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}