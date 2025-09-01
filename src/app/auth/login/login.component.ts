// src/app/auth/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { SocialLoginComponent } from '../social-login/social-login.component';

import { TitleService } from '../../core/services/title.service';
import { AuthService } from '../services/auth.service';

import { LoginCredentials } from '../../shared/interfaces/auth.interface';
import { CustomError } from '../../shared/interfaces/api.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    UiInputComponent,
    UiButtonComponent,
    SocialLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Iniciar sesión');
    this.checkForSessionExpired();

  }

  private checkForSessionExpired(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired']) {
        this.errorMessage = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };


    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;

        // Limpiar formulario
        this.loginForm.reset();
        this.submitted = false;

        this.router.navigate(['/dashboard']);
      },
      error: (error: CustomError) => {
        this.loading = false;
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginError(error: CustomError): void {
    if (environment.enableDebugMode) {
      console.error('❌ Error en login:', error);
    }

    // Mapear códigos de error a mensajes amigables
    switch (error.code) {
      case 'CREDENCIALES_INVALIDAS':
      case 'INVALID_CREDENTIALS':
        this.errorMessage = 'Email o contraseña incorrectos.';
        break;
      case 'NETWORK_ERROR':
        this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        break;
      case 'SERVER_ERROR':
        this.errorMessage = 'Error del servidor. Intenta más tarde.';
        break;
      default:
        this.errorMessage = error.message || 'Error inesperado. Intenta nuevamente.';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  clearError(): void {
    this.errorMessage = null;
  }

  loginWithGoogle(): void {
    this.errorMessage = 'Login con Google estará disponible próximamente.';
  }

  loginWithMicrosoft(): void {
    this.errorMessage = 'Login con Microsoft estará disponible próximamente.';
  }
}