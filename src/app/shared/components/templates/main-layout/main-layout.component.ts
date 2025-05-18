import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../organisms/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="main-layout">
      <app-header></app-header>
      <main class="content">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: `
    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content {
      padding-top: 64px;
      flex: 1;
    }
  `
})
export class MainLayoutComponent {} 