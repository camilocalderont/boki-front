import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas del dashboard 
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard], 
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/main/main.component').then(m => m.MainComponent),
        title: 'Dashboard Principal'
      }
    ]
  },
  
  {
    path: '',
    redirectTo: '/dashboard', 
    pathMatch: 'full'
  },
  
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];