import { Component, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'form-textarea-theme',
  template: `
    <div>
      <textarea 
        [placeholder]="placeholder"
        [rows]="rows"
        [class]="textareaClasses"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()">
      </textarea>
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
      useExisting: forwardRef(() => FormTextareaThemeComponent),
      multi: true
    }
  ]
})
export class FormTextareaThemeComponent extends BaseComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() rows: number = 2;
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';

  value: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get textareaClasses(): string {
    return [
      'w-full rounded-md p-2.5',
      this.theme?.theme?.colors?.forms?.input?.border?.light || '',
      this.theme?.theme?.colors?.forms?.input?.background?.light || '',
      this.theme?.theme?.colors?.forms?.input?.text?.light || '',
      this.theme?.theme?.colors?.forms?.input?.placeholder?.light || '',
      this.theme?.theme?.colors?.shadow?.sm?.light || '',
      this.theme?.theme?.colors?.focus?.ring?.primary?.light || '',
      this.theme?.theme?.colors?.forms?.input?.borderFocus?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get errorClasses(): string {
    return [
      'text-xs mt-1 pl-1',
      this.theme?.theme?.colors?.status?.error?.textLight?.light || ''
    ].filter(cls => cls).join(' ');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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