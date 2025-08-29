import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dropdown.component.html',
  styleUrl: './user-dropdown.component.scss'
})
export class UserDropdownComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownContainer', { static: true }) dropdownContainer!: ElementRef;
  
  isDropdownOpen = false;
  isDarkMode = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener usuario del sessionStorage
    this.loadUserFromSession();
    
    // Obtener estado del dark mode del localStorage
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Listener para clics fuera del dropdown
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
        // Si no hay datos en sessionStorage, usar datos por defecto
        this.currentUser = {
          name: 'Usuario Demo',
          email: 'demo@ejemplo.com'
        };
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      this.currentUser = {
        name: 'Usuario Demo',
        email: 'demo@ejemplo.com'
      };
    }
  }

  getInitials(): string {
    const name = this.currentUser?.name || this.currentUser?.VcFirstName || 'Usuario';
    return name.charAt(0).toUpperCase();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private onDocumentClick(event: Event): void {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    
    // Aplicar/quitar clase dark al body
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Aquí podrías emitir un evento para notificar el cambio a otros componentes
    console.log('Dark mode:', this.isDarkMode ? 'Activado' : 'Desactivado');
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}