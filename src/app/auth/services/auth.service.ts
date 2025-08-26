import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { 
  LoginCredentials, 
  BackendLoginCredentials, 
  BackendLoginResponse
} from '../../shared/interfaces/auth.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private userSubject = new BehaviorSubject<BackendLoginResponse['data']['user'] | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = sessionStorage.getItem(this.USER_KEY);
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
        
        if (environment.enableDebugMode) {
          console.log('👤 Usuario cargado desde storage:', user.VcEmail);
        }
      } catch (e) {
        console.error('❌ Error cargando usuario:', e);
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<BackendLoginResponse> {
    const backendCredentials: BackendLoginCredentials = {
      VcEmail: credentials.email.trim().toLowerCase(),
      VcPassword: credentials.password
    };

    if (environment.enableDebugMode) {
      console.log('🔐 Iniciando login para:', backendCredentials.VcEmail);
    }

    return this.userService.login(backendCredentials).pipe(
      tap((response: BackendLoginResponse) => {
        this.handleSuccessfulLogin(response);
      })
    );
  }

  private handleSuccessfulLogin(response: BackendLoginResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, response.data.token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
    this.userSubject.next(response.data.user);

    if (environment.enableDebugMode) {
      console.log('✅ Login exitoso:', {
        email: response.data.user.VcEmail,
        name: response.data.user.VcFirstName,
        id: response.data.user.Id,
        status: response.status
      });
    }
  }

  logout(): void {
    if (environment.enableDebugMode) {
      console.log('🚪 Cerrando sesión...');
    }
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private clearAuthData(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value && !!this.getToken();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): BackendLoginResponse['data']['user'] | null {
    return this.userSubject.value;
  }
}