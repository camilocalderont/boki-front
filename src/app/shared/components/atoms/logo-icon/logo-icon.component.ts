import { Component } from '@angular/core';

@Component({
  selector: 'app-logo-icon',
  standalone: true,
  template: `
    <img src="assets/logos/bokibot_logo.png" alt="Boki AI Logo" class="logo">
  `,
  styles: `
    .logo {
      height: 40px;
      width: auto;
    }
  `
})
export class LogoIconComponent {} 