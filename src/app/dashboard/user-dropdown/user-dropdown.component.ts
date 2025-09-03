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
    
    // Inicializar el dark mode
    this.initializeDarkMode();
    
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

  private initializeDarkMode(): void {
    // Obtener estado del dark mode del localStorage
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Aplicar el tema al cargar el componente
    this.applyTheme();
  }

  private applyTheme(): void {
    // Aplicar/quitar clase dark al html y body
    const htmlElement = document.documentElement;
    
    if (this.isDarkMode) {
      htmlElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      document.body.classList.remove('dark');
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
    
    // Aplicar el tema usando el método privado
    this.applyTheme();
    
    // Log para debugging
    console.log('Dark mode:', this.isDarkMode ? 'Activado' : 'Desactivado');
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}