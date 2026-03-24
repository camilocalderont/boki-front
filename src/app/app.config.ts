import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor, errorInterceptor, AUTH_TOKEN_GETTER } from '@shared/api';
import { provideTheme } from '@shared/tokens';
import { AuthStore } from '@features/auth';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    ...provideTheme(),
    {
      provide: AUTH_TOKEN_GETTER,
      useFactory: (authStore: AuthStore) => () => authStore.getToken(),
      deps: [AuthStore],
    },
  ]
};