import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../../../core/services/title.service';
import { FormInputComponent } from '../../../../shared/components/atoms/form-input/form-input.component';
import { BaseButtonComponent } from '../../../../shared/components/atoms/base-button/base-button.component';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormInputComponent, 
    BaseButtonComponent,
    AuthLayoutComponent,
    SocialLoginComponent,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  
  constructor(
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
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
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error durante el login:', error);
        this.loading = false;
        // Aquí podrías mostrar un mensaje de error
      }
    });
  }
  
  loginWithGoogle(): void {
    this.authService.loginWithGoogle().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => console.error('Error durante el login con Google:', error)
    });
  }
  
  loginWithMicrosoft(): void {
    this.authService.loginWithMicrosoft().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => console.error('Error durante el login con Microsoft:', error)
    });
  }
} 