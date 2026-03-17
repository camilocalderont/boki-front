import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { AvatarThemeComponent } from '../../shared/components/dropdown/avatar-theme.component';
import { DropdownContainerThemeComponent } from '../../shared/components/dropdown/dropdown-container-theme.component';
import { DropdownHeaderThemeComponent } from '../../shared/components/dropdown/dropdown-header-theme.component';
import { DropdownItemThemeComponent } from '../../shared/components/dropdown/dropdown-item-theme.component';
import { AvatarButtonThemeComponent } from '../../shared/components/dropdown/avatar-button-theme.component';
import { UserInfoThemeComponent } from '../../shared/components/dropdown/user-info-theme.component';
import { SeparatorThemeComponent } from '../../shared/components/dropdown/separator-theme.component';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    AvatarThemeComponent,
    DropdownContainerThemeComponent,
    DropdownHeaderThemeComponent,
    DropdownItemThemeComponent,
    AvatarButtonThemeComponent,
    UserInfoThemeComponent,
    SeparatorThemeComponent
  ],
  templateUrl: './user-dropdown.component.html',
  styleUrl: './user-dropdown.component.scss',
})
export class UserDropdownComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownContainer', { static: true })
  dropdownContainer!: ElementRef;

  themeService = inject(ThemeService);
  isDropdownOpen = false;
  currentUser: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserFromSession();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private loadUserFromSession(): void {
    try {
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      } else {
        this.currentUser = {
          name: 'Usuario Demo',
          email: 'demo@ejemplo.com',
        };
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      this.currentUser = {
        name: 'Usuario Demo',
        email: 'demo@ejemplo.com',
      };
    }
  }

  getInitials(): string {
    const name =
      this.currentUser?.name || this.currentUser?.VcFirstName || 'Usuario';
    return name.charAt(0).toUpperCase();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private onDocumentClick(event: Event): void {
    if (
      this.dropdownContainer &&
      !this.dropdownContainer.nativeElement.contains(event.target as Node)
    ) {
      this.closeDropdown();
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
