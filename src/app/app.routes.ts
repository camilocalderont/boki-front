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
        path: 'companies',
        loadComponent: () => import('./views/company/company.component').then(m => m.CompanyComponent),
        title: 'Empresas',
      },
      {
        path: 'companies/create',
        loadComponent: () => import('./views/forms/create-company/create-company.component').then(m => m.CreateCompanyComponent),
        title: 'Crear Empresa'
      },
      {
        path: 'companies/update/:id',
        loadComponent: () => import('./views/forms/create-company/create-company.component').then(m => m.CreateCompanyComponent),
        title: 'Editar Empresa'
      },
      {
        path: 'categories',
        loadComponent: () => import('./views/category/category.component').then(m => m.CategoryComponent),
        title: 'Categorías',
      },
      {
        path: 'categories/create',
        loadComponent: () => import('./views/forms/create-category/create-category.component').then(m => m.CreateCategoryComponent),
        title: 'Crear Categoría'
      },
      {
        path: 'categories/update/:id',
        loadComponent: () => import('./views/forms/create-category/create-category.component').then(m => m.CreateCategoryComponent),
        title: 'Editar Categoría'
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