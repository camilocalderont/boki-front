import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../../core/services/title.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex justify-center items-center relative p-4">
      <!-- Patrón de fondo -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M25%2C25%20L75%2C25%20L75%2C75%20L25%2C75%20Z%22%20fill%3D%22none%22%20stroke%3D%22rgba(203%2C%20213%2C%20225%2C%200.05)%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none"></div>
      
      <div class="w-full max-w-sm z-10 flex flex-col items-center">
        <!-- Logo - Más grande y prominente -->
        <div class="flex items-center justify-center mb-10">
          <img src="assets/logos/bokibot_logo.png" alt="Boki Logo" class="h-14 mr-3">
          <span class="text-5xl font-bold">
            <span class="text-white">boki</span><span class="text-[#3B82F6]"> AI</span>
          </span>
        </div>
        
        <!-- Contenedor del formulario -->
        <div class="w-full bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20 shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
            <p class="text-gray-300 text-sm">Accede a tu cuenta de boki-ai</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <app-input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Correo electrónico"
                formControlName="email">
              </app-input>
              <div *ngIf="submitted && loginForm.controls['email'].errors" class="text-red-500 text-xs mt-1 pl-1">
                <span *ngIf="loginForm.controls['email'].errors['required']">El correo es obligatorio</span>
                <span *ngIf="loginForm.controls['email'].errors['email']">Ingrese un correo válido</span>
              </div>
            </div>
            
            <div>
              <app-input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Contraseña"
                formControlName="password">
              </app-input>
              <div *ngIf="submitted && loginForm.controls['password'].errors" class="text-red-500 text-xs mt-1 pl-1">
                <span *ngIf="loginForm.controls['password'].errors['required']">La contraseña es obligatoria</span>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="remember" formControlName="remember" class="rounded border-gray-700 bg-gray-900/60 text-blue-500">
                <label for="remember" class="text-gray-300 text-sm">Recordarme</label>
              </div>
              <a href="#" class="text-blue-400 text-sm hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            
            <app-button 
              type="submit" 
              variant="primary" 
              [fullWidth]="true"
              [loading]="loading"
              size="large">
              Iniciar sesión
            </app-button>
          </form>
          
          <div class="my-6 relative flex items-center">
            <div class="flex-grow border-t border-gray-700"></div>
            <span class="mx-4 flex-shrink text-gray-400 text-sm">O</span>
            <div class="flex-grow border-t border-gray-700"></div>
          </div>
          
          <div class="space-y-3">
            <app-button 
              variant="social" 
              [fullWidth]="true"
              (buttonClick)="loginWithGoogle()">
              <div class="flex items-center justify-center w-full">
                <img src="assets/icons/google.svg" alt="Google" class="w-5 h-5 mr-2" /> 
                <span>Google</span>
              </div>
            </app-button>
            
            <app-button 
              variant="social" 
              [fullWidth]="true"
              (buttonClick)="loginWithMicrosoft()">
              <div class="flex items-center justify-center w-full">
                <img src="assets/icons/microsoft.svg" alt="Microsoft" class="w-5 h-5 mr-2" /> 
                <span>Microsoft</span>
              </div>
            </app-button>
          </div>
          
          <div class="mt-6 text-center text-sm text-gray-400">
            ¿No tienes una cuenta? <a href="#signup" class="text-blue-400 hover:underline">Regístrate aquí</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginPageComponent implements OnInit {
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
    
    // Aquí iría la lógica de autenticación real
    // Por ahora simularemos una petición con un timeout
    setTimeout(() => {
      // Simulación de login exitoso
      console.log('Login successful', this.loginForm.value);
      this.loading = false;
      
      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
  
  loginWithGoogle(): void {
    // Implementar lógica de login con Google
    console.log('Login with Google');
    setTimeout(() => this.router.navigate(['/dashboard']), 1000);
  }
  
  loginWithMicrosoft(): void {
    // Implementar lógica de login con Microsoft
    console.log('Login with Microsoft');
    setTimeout(() => this.router.navigate(['/dashboard']), 1000);
  }
}