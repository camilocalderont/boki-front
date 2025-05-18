import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-text',
  standalone: true,
  template: `
    <span class="brand-text">boki-ai</span>
  `,
  styles: `
    .brand-text {
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 1.25rem;
      font-weight: 500;
      color: #00B0FF;
      letter-spacing: -0.01em;
    }
  `
})
export class BrandTextComponent {} 