// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    
  const publicRoutes = ['/users/login', '/users/register'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  
  let authReq = req.clone({
    headers: req.headers.set('x-api-token', environment.apiToken)
  });

  if (!isPublicRoute && sessionStorage.getItem('auth_token')) {
    const userToken = sessionStorage.getItem('auth_token');
    authReq = authReq.clone({
      headers: authReq.headers.set('Authorization', `Bearer ${userToken}`)
    });
  }

  return next(authReq);
};