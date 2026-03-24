import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '@entities/user';
import { STORAGE_KEYS } from '@shared/config';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStore);

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = this.userStore.isAuthenticated;
  readonly currentUser = this.userStore.currentUser;

  setLoading(v: boolean): void {
    this._loading.set(v);
  }

  setError(err: string | null): void {
    this._error.set(err);
    this._loading.set(false);
  }

  handleLoginSuccess(
    token: string,
    user: {
      Id: number;
      VcEmail: string;
      VcFirstName: string;
      VcFirstLastName: string;
      VcNickName?: string;
    },
  ): void {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

    this.userStore.setUser({
      id: user.Id,
      email: user.VcEmail,
      firstName: user.VcFirstName,
      firstLastName: user.VcFirstLastName,
      nickName: user.VcNickName,
    });

    this._error.set(null);
    this._loading.set(false);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.userStore.clearUser();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}
