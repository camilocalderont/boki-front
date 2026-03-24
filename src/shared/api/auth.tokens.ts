import { InjectionToken } from '@angular/core';

/** Provides the current auth token without coupling shared/ to features/auth */
export const AUTH_TOKEN_GETTER = new InjectionToken<() => string | null>('AUTH_TOKEN_GETTER');
