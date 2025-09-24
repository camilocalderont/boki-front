import { Component, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'form-select-theme',
  template: `
    <div>
      <div class="relative">
        <select 
          [class]="selectClasses"
          [value]="value"
          (change)="onSelect($event)"
          (blur)="onBlur()">
          <option value="" disabled>{{ placeholder }}</option>
          <ng-content></ng-content>
        </select>
        <span [class]="arrowClasses">▼</span>
      </div>
      <p *ngIf="showError && errorMessage" [class]="errorClasses">
        {{ errorMessage }}
      </p>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectThemeComponent),
      multi: true
    }
  ]
})
export class FormSelectThemeComponent extends BaseComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';

  value: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get selectClasses(): string {
    return [
      'w-full rounded-md p-2.5 appearance-none',
      // Border - light y dark
      this.theme?.theme?.colors?.forms?.input?.border?.light || '',
      this.theme?.theme?.colors?.forms?.input?.border?.dark || '',
      // Background - light y dark
      this.theme?.theme?.colors?.forms?.input?.background?.light || '',
      this.theme?.theme?.colors?.forms?.input?.background?.dark || '',
      // Text - light y dark
      this.theme?.theme?.colors?.forms?.input?.text?.light || '',
      this.theme?.theme?.colors?.forms?.input?.text?.dark || '',
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

  get arrowClasses(): string {
    return [
      'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
      // Arrow color - light y dark
      this.theme?.theme?.colors?.text?.quaternary?.light || '',
      this.theme?.theme?.colors?.text?.quaternary?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  get errorClasses(): string {
    return [
      'text-xs mt-1',
      // Error text - light y dark
      this.theme?.theme?.colors?.status?.error?.text?.light || '',
      this.theme?.theme?.colors?.status?.error?.text?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  onSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

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