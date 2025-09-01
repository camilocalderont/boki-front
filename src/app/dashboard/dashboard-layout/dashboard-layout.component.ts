import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';
import { ThemeConfigService } from '../../services/theme-config.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, UserDropdownComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit {
  isCollapsed = false;
  theme: any = null;

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
    private router: Router,
    private themeConfigService: ThemeConfigService
  ) {}

  ngOnInit(): void {
    // Obtener la configuración ya cargada (sin nueva petición)
    this.theme = this.themeConfigService.getCurrentTheme();
    
    if (this.theme) {
      console.log('Dashboard Layout - Configuración obtenida:', this.theme);
    } else {
      console.log('Dashboard Layout - Configuración aún no disponible');
    }
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