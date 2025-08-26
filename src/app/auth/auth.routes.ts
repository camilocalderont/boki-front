import { Routes } from '@angular/router';
import { noAuthGuard } from '../core/guards/no-auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];