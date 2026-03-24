import { Injectable, computed, signal } from '@angular/core';
import { STORAGE_KEYS } from '@shared/config';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _currentUser = signal<User | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  readonly displayName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return user.nickName ?? `${user.firstName} ${user.firstLastName}`;
  });

  readonly token = computed(() =>
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  );

  constructor() {
    this.loadFromStorage();
  }

  setUser(user: User, token?: string): void {
    this._currentUser.set(user);
    sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  }

  clearUser(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  private loadFromStorage(): void {
    const stored = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        this._currentUser.set(user);
      } catch {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    }
  }
}
