import { Routes } from '@angular/router';
import { PnmcLayoutComponent } from './pnmc-layout/pnmc-layout.component';
import { PnmcHomeComponent } from './pages/pnmc-home/pnmc-home.component';

export const pnmcRoutes: Routes = [
  {
    path: '',
    component: PnmcLayoutComponent,
    children: [
      {
        path: '',
        component: PnmcHomeComponent,
        title: 'PNMC - Plataforma Nacional de Músicos Colombianos'
      },
      {
        path: 'estoy-buscando',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Estoy Buscando - PNMC'
      },
      {
        path: 'portafolio',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Portafolio - PNMC'
      },
      {
        path: 'proyectos',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Proyectos - PNMC'
      },
      {
        path: 'mapa',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Mapa Cultural - PNMC'
      },
      {
        path: 'calendario',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Calendario - PNMC'
      },
      {
        path: 'noticias',
        component: PnmcHomeComponent, // Por ahora usa el mismo componente
        title: 'Noticias - PNMC'
      }
    ]
  }
];
