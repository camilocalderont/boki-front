import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const publicRoutes = ['/users/login', '/users/register'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (!isPublicRoute && sessionStorage.getItem('auth_token')) {
    const userToken = sessionStorage.getItem('auth_token');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${userToken}`)
    });
    return next(authReq);
  }

  return next(req);
};
