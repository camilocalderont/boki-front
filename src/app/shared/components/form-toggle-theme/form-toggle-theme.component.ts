import { Component, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'form-toggle-theme',
  template: `
    <div class="flex items-center space-x-3">
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" 
               class="sr-only peer" 
               [checked]="value"
               (change)="onToggle($event)" />
        <div [class]="toggleClasses"></div>
        <span [class]="labelClasses">{{ label }}</span>
      </label>
    </div>
  `,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormToggleThemeComponent),
      multi: true
    }
  ]
})
export class FormToggleThemeComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label: string = '';

  value: boolean = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  get toggleClasses(): string {
    return [
      'w-11 h-6 rounded-full peer transition-all',
      'peer-checked:after:translate-x-full peer-checked:after:border-white',
      'after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px]',
      'after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
      this.theme?.theme?.colors?.forms?.toggle?.background?.light || '',
      this.theme?.theme?.colors?.focus?.ring?.secondary?.light || '',
      this.theme?.theme?.colors?.forms?.toggle?.backgroundActive?.light || '',
      this.theme?.theme?.colors?.forms?.toggle?.thumb?.light || ''
    ].filter(cls => cls).join(' ');
  }

  get labelClasses(): string {
    return [
      'ml-3 text-sm font-medium',
      this.theme?.theme?.colors?.forms?.label?.light || ''
    ].filter(cls => cls).join(' ');
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.value = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }
}