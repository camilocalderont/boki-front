import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@features/auth';

export const routes: Routes = [
  // Auth — new FSD pages
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('@pages/login').then(m => m.LoginPageComponent),
        title: 'Iniciar Sesión',
      },
      {
        path: 'register',
        loadComponent: () => import('@pages/register').then(m => m.RegisterPageComponent),
        title: 'Registro',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Dashboard — FSD layout shell with new pages
  {
    path: 'dashboard',
    loadComponent: () => import('@pages/shell').then(m => m.ShellPageComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard').then(m => m.DashboardPageComponent),
        title: 'Dashboard Principal',
      },
      {
        path: 'company',
        loadComponent: () => import('@pages/company').then(m => m.CompanyPageComponent),
        title: 'Empresa',
      },
      { path: 'companies', redirectTo: 'company', pathMatch: 'full' },
      {
        path: 'catalog',
        loadComponent: () => import('@pages/catalog').then(m => m.CatalogPageComponent),
        title: 'Catálogo de Servicios',
      },
      { path: 'categories', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: 'professionals',
        loadComponent: () => import('@pages/professionals').then(m => m.ProfessionalsPageComponent),
        title: 'Profesionales',
      },
      {
        path: 'faqs',
        loadComponent: () => import('@pages/faqs').then(m => m.FaqsPageComponent),
        title: 'FAQs',
      },
      {
        path: 'plans',
        loadComponent: () => import('@pages/plans').then(m => m.PlansPageComponent),
        title: 'Planes',
      },
      {
        path: 'appointments',
        loadComponent: () => import('@pages/appointments').then(m => m.AppointmentsPageComponent),
        title: 'Citas',
      },
    ],
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
