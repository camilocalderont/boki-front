import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-container">
      <input
        [type]="type"
        [id]="id"
        [name]="name"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        class="input-field"
      />
      <button *ngIf="type === 'password' && value" 
              type="button" 
              class="toggle-visibility"
              (click)="toggleVisibility()"
              tabindex="-1">
        <span>👁️</span>
      </button>
    </div>
  `,
  styles: [`
    .input-container {
      position: relative;
      width: 100%;
    }
    
    .input-field {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      background-color: rgba(15, 23, 42, 0.7);
      font-size: 14px;
      color: #FFFFFF;
      transition: border-color 0.15s ease, background-color 0.15s ease;
      backdrop-filter: blur(4px);
    }
    
    .input-field:focus {
      border-color: rgba(59, 130, 246, 0.7);
      background-color: rgba(15, 23, 42, 0.85);
      outline: none;
    }
    
    .input-field::placeholder {
      color: #94A3B8;
    }
    
    .toggle-visibility {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #94A3B8;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
  `],
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