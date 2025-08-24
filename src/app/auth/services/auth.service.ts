import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Verificar si hay usuario en localStorage al inicializar
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('user_token');
    if (token) {
      // Simular usuario para el MVP
      this.currentUser = {
        id: '1',
        name: 'Usuario Demo',
        email: 'demo@ejemplo.com'
      };
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user_token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  login(credentials: LoginRequest): Observable<any> {
    // Simulación para MVP - reemplaza con tu API real
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          localStorage.setItem('user_token', 'demo_token_12345');
          this.currentUser = {
            id: '1',
            name: 'Usuario Demo',
            email: credentials.email
          };
          observer.next({ success: true });
        } else {
          observer.error({ message: 'Credenciales inválidas' });
        }
        observer.complete();
      }, 1500);
    });
  }

  loginWithGoogle(): Observable<any> {
    return of({ success: true }).pipe(delay(1000));
  }

  loginWithMicrosoft(): Observable<any> {
    return of({ success: true }).pipe(delay(1000));
  }

  logout(): void {
    localStorage.removeItem('user_token');
    this.currentUser = null;
  }
}