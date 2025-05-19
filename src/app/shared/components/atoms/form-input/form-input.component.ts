import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.component.html',
  styleUrls: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = '';
  
  private _value: string = '';
  originalType: string = 'password';
  
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
  
  // Mostrar la contraseña al mantener presionado
  showPassword(): void {
    if (this.type === 'password') {
      this.originalType = this.type;
      this.type = 'text';
    }
  }
  
  // Ocultar la contraseña al soltar
  hidePassword(): void {
    if (this.type === 'text' && this.originalType === 'password') {
      this.type = 'password';
    }
  }
  
  // Alternar visibilidad de la contraseña al hacer clic
  toggleVisibility(): void {
    if (this.type === 'password') {
      this.originalType = this.type;
      this.type = 'text';
    } else if (this.type === 'text' && this.originalType === 'password') {
      this.type = 'password';
    }
  }
} 