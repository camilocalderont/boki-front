import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  templateUrl: './ui-input.component.html',
  styleUrl: './ui-input.component.scss'
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = '';
  
  value: string = '';
  originalType: string = '';
  disabled: boolean = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor() {
    this.originalType = this.type;
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  toggleVisibility(): void {
    this.type = this.type === 'password' ? 'text' : 'password';
  }
}