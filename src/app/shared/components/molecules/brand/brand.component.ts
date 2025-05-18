import { Component } from '@angular/core';
import { LogoIconComponent } from '../../atoms/logo-icon/logo-icon.component';
import { BrandTextComponent } from '../../atoms/brand-text/brand-text.component';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [LogoIconComponent, BrandTextComponent],
  template: `
    <div class="brand">
      <app-logo-icon></app-logo-icon>
      <app-brand-text></app-brand-text>
    </div>
  `,
  styles: `
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
  `
})
export class BrandComponent {} 