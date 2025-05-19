import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../models/auth.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // Cargar el usuario desde localStorage si existe
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        this.userSubject.next(JSON.parse(storedUser));
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  // Iniciar sesión con email y contraseña
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // TODO: Reemplazar con la llamada real a tu API
    // return this.http.post<AuthResponse>('api/auth/login', credentials).pipe(
    //   tap(response => this.handleAuthentication(response))
    // );

    // Simulación para desarrollo
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: credentials.email,
          name: 'Usuario Demo',
          role: 'user'
        }
      };
      this.handleAuthentication(mockResponse);
      return of(mockResponse);
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  // Registrar un nuevo usuario
  register(userData: RegisterCredentials): Observable<AuthResponse> {
    // TODO: Reemplazar con la llamada real a tu API
    // return this.http.post<AuthResponse>('api/auth/register', userData).pipe(
    //   tap(response => this.handleAuthentication(response))
    // );

    // Simulación para desarrollo
    if (userData.password === userData.confirmPassword) {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '2',
          email: userData.email,
          name: userData.name,
          role: 'user'
        }
      };
      this.handleAuthentication(mockResponse);
      return of(mockResponse);
    }
    return throwError(() => new Error('Las contraseñas no coinciden'));
  }

  // Iniciar sesión con Google
  loginWithGoogle(): Observable<AuthResponse> {
    // TODO: Implementar login con Google
    console.log('Iniciando sesión con Google');
    
    // Simulación para desarrollo
    const mockResponse: AuthResponse = {
      token: 'mock-google-jwt-token',
      user: {
        id: '3',
        email: 'google@example.com',
        name: 'Usuario Google',
        role: 'user'
      }
    };
    this.handleAuthentication(mockResponse);
    return of(mockResponse);
  }

  // Iniciar sesión con Microsoft
  loginWithMicrosoft(): Observable<AuthResponse> {
    // TODO: Implementar login con Microsoft
    console.log('Iniciando sesión con Microsoft');
    
    // Simulación para desarrollo
    const mockResponse: AuthResponse = {
      token: 'mock-microsoft-jwt-token',
      user: {
        id: '4',
        email: 'microsoft@example.com',
        name: 'Usuario Microsoft',
        role: 'user'
      }
    };
    this.handleAuthentication(mockResponse);
    return of(mockResponse);
  }

  // Cerrar sesión
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  // Obtener el token actual
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Manejar la respuesta de autenticación
  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  // Limpiar datos de autenticación
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }
} 