import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser: any = null;

  navigationItems = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard', active: true },
    { label: 'Flujos', icon: 'workflow', route: '/flows', active: false },
    { label: 'Empresas', icon: 'building', route: '/companies', active: false },
    { label: 'Citas', icon: 'calendar', route: '/appointments', active: false },
    { label: 'Analytics', icon: 'chart', route: '/analytics', active: false },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/settings',
      active: false,
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() || {
      name: 'Usuario Demo',
      email: 'demo@ejemplo.com',
    };
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  setActiveRoute(route: string): void {
    this.navigationItems.forEach((item) => {
      item.active = item.route === route;
    });
  }
}
