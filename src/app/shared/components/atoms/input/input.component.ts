import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = '';
  
  private _value: string = '';
  private originalType: string = 'text';
  
  // Control Value Accessor
  onChange: any = () => {};
  onTouched: any = () => {};
  
  get value(): string {
    return this._value;
  }
  
  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }
  
  writeValue(value: string): void {
    this._value = value || '';
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
  }
  
  onBlur(): void {
    this.onTouched();
  }
  
  toggleVisibility(): void {
    if (!this.originalType) {
      this.originalType = this.type;
    }
    
    this.type = this.type === 'password' ? 'text' : 'password';
  }
} 