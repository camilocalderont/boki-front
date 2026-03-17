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
      },
      {
        path: 'company',
        loadComponent: () => import('./views/company-module/company-module.component').then(m => m.CompanyModuleComponent),
        title: 'Empresa'
      },
      {
        path: 'companies',
        redirectTo: 'company',
        pathMatch: 'full'
      },
      {
        path: 'catalog',
        loadComponent: () => import('./views/catalog-module/catalog-module.component').then(m => m.CatalogModuleComponent),
        title: 'Catalogo de Servicios'
      },
      {
        path: 'categories',
        redirectTo: 'catalog',
        pathMatch: 'full'
      },
      {
        path: 'professionals',
        loadComponent: () => import('./views/professional-module/professional-module.component').then(m => m.ProfessionalModuleComponent),
        title: 'Profesionales'
      },
      {
        path: 'faqs',
        loadComponent: () => import('./views/faqs/faqs.component').then(m => m.FaqsComponent),
        title: 'FAQS',
      },
      {
        path: 'faqs/create',
        loadComponent: () => import('./views/forms/create-faqs/create-faqs.component').then(m => m.CreateFaqsComponent),
        title: 'Crear FAQ'
      },
      {
        path: 'faqs/update/:id',
        loadComponent: () => import('./views/forms/create-faqs/create-faqs.component').then(m => m.CreateFaqsComponent),
        title: 'Editar FAQ'
      },
      {
        path: 'appointments',
        loadComponent: () => import('./views/appointments/appointments.component').then(m => m.AppointmentsComponent),
        title: 'Citas'
      },
      {
        path: 'appointments/new',
        loadComponent: () => import('./views/appointments/booking-wizard/booking-wizard.component').then(m => m.BookingWizardComponent),
        title: 'Nueva Cita'
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