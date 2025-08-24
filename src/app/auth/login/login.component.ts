import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Importar componentes con nuevas rutas
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { SocialLoginComponent } from '../social-login/social-login.component';

// Servicios
import { TitleService } from '../../core/services/title.service';



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
  
  constructor(
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Iniciar sesión');
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Simulación de login para el MVP - reemplaza con tu lógica real después
    setTimeout(() => {
      this.loading = false;
      // Simular login exitoso
      localStorage.setItem('user_token', 'demo_token_12345');
      this.router.navigate(['/dashboard']);
    }, 1500);
    
    // Descomenta cuando tengas el AuthService funcionando:
    // this.authService.login(this.loginForm.value).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: (error) => {
    //     console.error('Error durante el login:', error);
    //     this.loading = false;
    //   }
    // });
  }
  
  loginWithGoogle(): void {
    console.log('Login con Google - implementar después');
    // Simular login social
    localStorage.setItem('user_token', 'google_token_12345');
    this.router.navigate(['/dashboard']);
  }
  
  loginWithMicrosoft(): void {
    console.log('Login con Microsoft - implementar después');
    // Simular login social
    localStorage.setItem('user_token', 'microsoft_token_12345');
    this.router.navigate(['/dashboard']);
  }
}