import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule, 
    UserDropdownComponent,
    ThemeComponentsModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent extends BaseComponent {
  isCollapsed = false;

  navigationItems = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard', active: true },
    { label: 'Flujos', icon: 'workflow', route: '/flows', active: false },
    { label: 'Empresas', icon: 'building', route: '/dashboard/companies', active: false },
    { label: 'Categorias', icon: 'list', route: '/dashboard/categories', active: false },
    { label: 'FAQS', icon: 'question', route: '/dashboard/faqs', active: false },
    { label: 'Citas', icon: 'calendar', route: '/appointments', active: false },
    { label: 'Analytics', icon: 'chart', route: '/analytics', active: false },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/settings',
      active: false,
    },
  ];

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {
    super(); // 👈 Importante: llamar al constructor padre
  }

  protected onComponentInit(): void {
    console.log('Dashboard Layout inicializado con tema:', this.theme);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  setActiveRoute(route: string): void {
    this.navigationItems.forEach((item) => {
      item.active = item.route === route;
    });
  }
}