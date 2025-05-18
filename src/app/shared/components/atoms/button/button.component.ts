import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled || loading"
      [ngClass]="['button', variant, size, fullWidth ? 'full-width' : '']"
      (click)="onClick($event)">
      <span *ngIf="loading" class="loading-spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      position: relative;
      overflow: hidden;
    }
    
    .button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    /* Variants */
    .primary {
      background: linear-gradient(to right, #0095F6, #2563EB);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      color: white;
    }
    
    .primary:hover:not(:disabled) {
      background: linear-gradient(to right, #0081d6, #1d4ed8);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
      transform: translateY(-1px);
    }
    
    .primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }
    
    .secondary {
      background-color: transparent;
      border: 1px solid rgba(59, 130, 246, 0.5);
      color: #3B82F6;
    }
    
    .secondary:hover:not(:disabled) {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.8);
    }
    
    .tertiary {
      background-color: transparent;
      color: #3B82F6;
    }
    
    .tertiary:hover:not(:disabled) {
      background-color: rgba(59, 130, 246, 0.1);
    }
    
    .social {
      background-color: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #FFFFFF;
      backdrop-filter: blur(4px);
    }
    
    .social:hover:not(:disabled) {
      background-color: rgba(15, 23, 42, 0.8);
      border-color: rgba(59, 130, 246, 0.4);
    }
    
    /* Sizes */
    .small {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .medium {
      padding: 10px 16px;
      font-size: 14px;
    }
    
    .large {
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .full-width {
      width: 100%;
    }
    
    /* Loading spinner */
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'social' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  onClick(event: MouseEvent): void {
    this.buttonClick.emit(event);
  }
} 