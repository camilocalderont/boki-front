import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../../core/services/title.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido a tu panel de control de boki-ai</p>
      </header>
      
      <div class="dashboard-content">
        <div class="card">
          <h2>Resumen</h2>
          <p>Éste es tu panel de control principal. Aquí podrás ver estadísticas y gestionar tu cuenta.</p>
        </div>
        
        <div class="card">
          <h2>Funcionalidades</h2>
          <ul>
            <li>Administrar perfil</li>
            <li>Ver estadísticas</li>
            <li>Gestionar proyectos</li>
            <li>Configurar preferencias</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 2rem;
    }
    
    .dashboard-header {
      margin-bottom: 2rem;
    }
    
    .dashboard-header h1 {
      font-size: 2rem;
      color: #1E293B;
      margin-bottom: 0.5rem;
    }
    
    .dashboard-header p {
      color: #64748B;
    }
    
    .dashboard-content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    
    .card h2 {
      color: #1E293B;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 0.5rem;
    }
    
    ul {
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      color: #334155;
    }
  `
})
export class DashboardPageComponent implements OnInit {
  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Panel de Control');
  }
} 