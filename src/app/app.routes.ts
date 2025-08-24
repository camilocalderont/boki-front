import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rutas de autenticación (sin guard por ahora)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas del dashboard (sin guard por ahora para probar)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/main/main.component').then(m => m.MainComponent)
      }
    ]
  },
  
  // Redirección por defecto - ESTO ES CLAVE
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  // Wildcard para 404
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];