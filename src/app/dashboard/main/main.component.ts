import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  
  stats = [
    {
      title: 'Conversaciones activas',
      value: '245',
      change: '+12%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: 'chat'
    },
    {
      title: 'Citas programadas',
      value: '32',
      change: '+5%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: 'calendar'
    },
    {
      title: 'Empresas registradas',
      value: '8',
      change: '0%',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: 'building'
    },
    {
      title: 'Tasa de conversión',
      value: '68%',
      change: '+3%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: 'chart'
    }
  ];

  recentActivity = [
    {
      type: 'appointment',
      message: 'Nueva cita programada para mañana',
      time: 'Hace 5 minutos',
      user: 'Ana García'
    },
    {
      type: 'conversation',
      message: 'Conversación completada exitosamente',
      time: 'Hace 15 minutos',
      user: 'Carlos López'
    },
    {
      type: 'company',
      message: 'Empresa "TechCorp" se registró',
      time: 'Hace 1 hora',
      user: 'Sistema'
    }
  ];

  ngOnInit(): void {
    console.log('Dashboard Main cargado');
  }

  refreshData(): void {
    console.log('Refrescando datos del dashboard...');
    // Aquí implementarás la lógica para refrescar datos
  }
}