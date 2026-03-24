import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_TOKEN_GETTER } from './auth.tokens';

const PUBLIC_ROUTES = ['/users/login', '/users/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublicRoute = PUBLIC_ROUTES.some(route => req.url.includes(route));
  if (isPublicRoute) return next(req);

  const getToken = inject(AUTH_TOKEN_GETTER, { optional: true });
  const token = getToken?.();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
