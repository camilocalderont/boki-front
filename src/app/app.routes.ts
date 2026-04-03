import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@features/auth';

export const routes: Routes = [
  // Public — no auth required
  {
    path: 'empresa',
    loadComponent: () =>
      import('../widgets/public-layout/ui/public-layout.component').then(
        m => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: ':slug',
        loadComponent: () =>
          import('../pages/public-company/ui/public-company-page.component').then(
            m => m.PublicCompanyPageComponent,
          ),
      },
      {
        path: ':slug/reservar',
        loadComponent: () =>
          import('../pages/public-booking/ui/public-booking-page.component').then(
            m => m.PublicBookingPageComponent,
          ),
      },
    ],
  },
  {
    path: 'cita',
    loadComponent: () =>
      import('../widgets/public-layout/ui/public-layout.component').then(
        m => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: 'confirmar/:token',
        loadComponent: () =>
          import('../pages/public-appointment/ui/public-appointment-page.component').then(
            m => m.PublicAppointmentPageComponent,
          ),
      },
      {
        path: ':token',
        loadComponent: () =>
          import('../pages/public-appointment/ui/public-appointment-page.component').then(
            m => m.PublicAppointmentPageComponent,
          ),
      },
    ],
  },

  // Client dashboard — public, no auth required
  {
    path: 'cliente/:token',
    loadComponent: () =>
      import('../pages/client-dashboard/ui/client-dashboard-layout.component').then(
        m => m.ClientDashboardLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'historial', pathMatch: 'full' },
      {
        path: 'historial',
        loadComponent: () =>
          import('../pages/client-dashboard/ui/client-history-page.component').then(
            m => m.ClientHistoryPageComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../pages/client-dashboard/ui/client-profile-page.component').then(
            m => m.ClientProfilePageComponent,
          ),
      },
      {
        path: 'ajustes',
        loadComponent: () =>
          import('../pages/client-dashboard/ui/client-settings-page.component').then(
            m => m.ClientSettingsPageComponent,
          ),
      },
    ],
  },

  // Auth — pages
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [noAuthGuard],
        loadComponent: () => import('@pages/login').then(m => m.LoginPageComponent),
        title: 'Iniciar Sesión',
      },
      {
        path: 'register',
        canActivate: [noAuthGuard],
        loadComponent: () => import('@pages/register').then(m => m.RegisterPageComponent),
        title: 'Registro',
      },
      {
        path: 'onboarding/start',
        canActivate: [noAuthGuard],
        loadChildren: () => import('@pages/onboarding-start').then(m => m.onboardingStartRoutes),
        title: 'Iniciar registro',
      },
      {
        path: 'onboarding/:token',
        loadChildren: () => import('@pages/onboarding').then(m => m.onboardingRoutes),
        title: 'Completar registro',
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
