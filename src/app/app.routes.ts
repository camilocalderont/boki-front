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
        loadComponent: () => import('./dashboard/company/company.component').then(m => m.CompanyComponent),
        title: 'Empresas',
      },
      {
        path: 'companies/create',
        loadComponent: () => import('./dashboard/company/form-company/form-company.component').then(m => m.FormCompanyComponent),
        title: 'Crear Empresa'
      },
      {
        path: 'companies/update/:id',
        loadComponent: () => import('./dashboard/company/form-company/form-company.component').then(m => m.FormCompanyComponent),
        title: 'Editar Empresa'
      },
      {
        path: 'categories',
        loadComponent: () => import('./dashboard/category/category.component').then(m => m.CategoryComponent),
        title: 'Categorías',
      },
      {
        path: 'categories/create',
        loadComponent: () => import('./dashboard/category/form-category/form-category.component').then(m => m.FormCategoryComponent),
        title: 'Crear Categoría'
      },
      {
        path: 'categories/update/:id',
        loadComponent: () => import('./dashboard/category/form-category/form-category.component').then(m => m.FormCategoryComponent),
        title: 'Editar Categoría'
      },
      {
        path: 'faqs',
        loadComponent: () => import('./dashboard/faqs/faqs.component').then(m => m.FaqsComponent),
        title: 'FAQS',
      },
      {
        path: 'faqs/create',
        loadComponent: () => import('./dashboard/faqs/form-faqs/form-faqs.component').then(m => m.FormFaqsComponent),
        title: 'Crear FAQ'
      },
      {
        path: 'faqs/update/:id',
        loadComponent: () => import('./dashboard/faqs/form-faqs/form-faqs.component').then(m => m.FormFaqsComponent),
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