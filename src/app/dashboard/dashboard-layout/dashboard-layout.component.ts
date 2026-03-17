import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { ThemeService } from '../../services/theme.service';
import { NavigationService, NavigationItem } from '../../services/navigation.service';

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
  themeService = inject(ThemeService);
  private navigationService = inject(NavigationService);
  isCollapsed = false;
  navigationItems: (NavigationItem & { active: boolean })[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.navigationService.getNavigationItems().subscribe(items => {
      this.navigationItems = items.map(item => ({
        ...item,
        active: this.router.url === item.route || this.router.url.startsWith(item.route + '/')
      }));
    });
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