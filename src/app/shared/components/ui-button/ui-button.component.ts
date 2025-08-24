import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss'
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'social' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }

  get buttonClasses(): string {
    let classes = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Tamaños
    if (this.size === 'small') classes += ' px-3 py-1.5 text-sm rounded-md';
    else if (this.size === 'large') classes += ' px-6 py-3 text-base rounded-lg';
    else classes += ' px-4 py-2.5 text-sm rounded-md';

    // Variantes
    if (this.variant === 'primary') {
      classes += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    } else if (this.variant === 'secondary') {
      classes += ' bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
    } else if (this.variant === 'social') {
      classes += ' bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700/80 focus:ring-blue-500';
    }

    // Ancho completo
    if (this.fullWidth) classes += ' w-full';

    return classes;
  }
}

