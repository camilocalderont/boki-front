import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const AUTH_ROUTES: Routes = [
  { path: 'log-in', component: LoginComponent },
  // Aquí agregaremos más rutas como register y recovery después
  { path: '', redirectTo: 'log-in', pathMatch: 'full' },
]; 