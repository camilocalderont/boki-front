import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../../molecules/brand/brand.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BrandComponent, RouterLink],
  template: `
    <header>
      <div class="header-container">
        <app-brand></app-brand>
        <div class="spacer"></div>
        <nav class="navigation">
          <a routerLink="/" class="nav-link">Inicio</a>
          <a routerLink="/login" class="nav-link login-btn">Iniciar sesión</a>
        </nav>
      </div>
    </header>
  `,
  styles: `
    header {
      height: 64px;
      width: 100%;
      background-color: white;
      box-shadow: 0 2px 6px 0 rgba(0,0,0,0.12);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
    }

    .header-container {
      height: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
    }

    .spacer {
      flex: 1;
    }
    
    .navigation {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .nav-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    
    .nav-link:hover {
      color: #00B0FF;
    }
    
    .login-btn {
      background-color: #00B0FF;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    
    .login-btn:hover {
      background-color: #0091EA;
      color: white;
    }
  `
})
export class HeaderComponent {} 