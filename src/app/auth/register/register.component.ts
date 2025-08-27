import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { RegisterCredentials } from '../../shared/interfaces/auth.interface';
import { AuthService } from '../services/auth.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { SnackBarService } from '../../shared/components/snack-bar/service/snack-bar.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    UiInputComponent,
    UiButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBarService: SnackBarService
  ) {
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
  }

  // Crear el FormGroup con todos los campos y validaciones
  private createRegisterForm(): FormGroup {
    return this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          this.noNumbersValidator
        ]
      ],
      secondName: [
        '',
        [
          Validators.maxLength(50),
          this.noNumbersValidator
        ]
      ],

      firstLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          this.noNumbersValidator
        ]
      ],
      secondLastName: [
        '',
        [
          Validators.maxLength(50),
          this.noNumbersValidator
        ]
      ],

      nickName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9_-]+$') // Solo letras, números, guiones y guiones bajos
        ]
      ],

      identificationNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]+$')
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ],

    }, {
      // Validador para comparar contraseñas
      validators: [this.passwordMatchValidator]
    });
  }

  // Validador personalizado: no permitir números en nombres
  private noNumbersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const hasNumbers = /\d/.test(control.value);
    return hasNumbers ? { hasNumbers: true } : null;
  }

  // Validador personalizado: fortaleza de contraseña
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const password = control.value;
    const errors: any = {};

    // Verificar mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.needsUppercase = true;
    }

    // Verificar minúscula
    if (!/[a-z]/.test(password)) {
      errors.needsLowercase = true;
    }

    // Verificar número
    if (!/\d/.test(password)) {
      errors.needsNumber = true;
    }

    // Verificar carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.needsSpecialChar = true;
    }

    // Si tiene errores, devolver objeto con flag general
    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  }

  // Validador personalizado: contraseñas coinciden
  private passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      // Agregar error al campo confirmPassword
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Limpiar error si las contraseñas coinciden
    const confirmControl = formGroup.get('confirmPassword');
    if (confirmControl?.errors?.['passwordMismatch']) {
      delete confirmControl.errors['passwordMismatch'];
      if (Object.keys(confirmControl.errors).length === 0) {
        confirmControl.setErrors(null);
      }
    }

    return null;
  }

  // Obtener la fortaleza de la contraseña para mostrar indicador visual
  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) strength++;

    return strength;
  }

  // Obtener color para el indicador de fortaleza
  getPasswordStrengthColor(index: number): string {
    const strength = this.getPasswordStrength();
    if (index < strength) {
      switch (strength) {
        case 1:
        case 2: return 'bg-red-500';
        case 3: return 'bg-yellow-500';
        case 4: return 'bg-blue-500';
        case 5: return 'bg-green-500';
        default: return 'bg-gray-600';
      }
    }
    return 'bg-gray-600';
  }

  // Obtener texto de fortaleza
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 0:
      case 1: return 'Muy débil';
      case 2: return 'Débil';
      case 3: return 'Regular';
      case 4: return 'Fuerte';
      case 5: return 'Muy fuerte';
      default: return '';
    }
  }

  // Obtener color del texto de fortaleza
  getPasswordStrengthTextColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 0:
      case 1: return 'text-red-400';
      case 2: return 'text-red-400';
      case 3: return 'text-yellow-400';
      case 4: return 'text-blue-400';
      case 5: return 'text-green-400';
      default: return 'text-gray-400';
    }
  }

  // Enviar formulario
  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      this.registerForm.markAllAsTouched();
      console.log('Formulario inválido:', this.registerForm.errors);
      return;
    }

    this.loading = true;

    // Preparar datos para el registro
    const formData = this.registerForm.value;
    const registerData: RegisterCredentials = {
      firstName: formData.firstName.trim(),
      secondName: formData.secondName?.trim() || '',
      firstLastName: formData.firstLastName.trim(),
      secondLastName: formData.secondLastName?.trim() || '',
      nickName: formData.nickName.trim(),
      identificationNumber: formData.identificationNumber.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };

    console.log('Datos de registro:', registerData);

    // Llamar al servicio de registro
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.loading = false;

        // Mostrar mensaje de éxito
        this.snackBarService.open(`¡Registro exitoso! Bienvenido ${response.data.VcFirstName}. Ahora puedes iniciar sesión.`, {
          type: 'success',
          duration: 4000,
          position: 'bot-right'
        });

        // Redirigir al login
        this.router.navigate(['/auth/login'], {
          queryParams: {
            email: response.data.VcEmail,
            registered: 'true'
          }
        });
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.loading = false;

        // Manejar diferentes tipos de errores
        let errorMessage = 'Error durante el registro';

        if (error.code === 'USER_ALREADY_EXISTS') {
          errorMessage = 'Ya existe una cuenta con este correo electrónico';
        } else if (error.code === 'VALIDATION_ERROR') {
          errorMessage = 'Error de validación. Verifica los datos ingresados';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.snackBarService.open(errorMessage, {
          type: 'info',
          duration: 4000,
          position: 'bot-right'
        });
      }
    });
  }

  // Métodos para login social 
  loginWithGoogle(): void {
    // TODO: Implementar
    console.log('Login con Google');
  }

  loginWithMicrosoft(): void {
    // TODO: Implementar  
    console.log('Login con Microsoft');
  }
}