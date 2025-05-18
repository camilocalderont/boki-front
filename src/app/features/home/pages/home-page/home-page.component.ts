import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../../core/services/title.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>Bienvenido a Boki AI</h1>
      <p>Tu asistente inteligente para optimizar tu día a día</p>
    </div>
  `,
  styles: `
    .home-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2.5rem;
    }
    
    p {
      color: #666;
      font-size: 1.2rem;
    }
  `
})
export class HomePageComponent implements OnInit {
  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Inicio');
  }
} 