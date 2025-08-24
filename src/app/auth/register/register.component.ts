import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';


import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    UiInputComponent,
    UiButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.registerForm.invalid) {
      return;
    }

    // Verificar que las contraseñas coincidan
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    this.loading = true;
    
    // Simulación para MVP
    setTimeout(() => {
      this.loading = false;
      localStorage.setItem('user_token', 'new_user_token_12345');
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
}