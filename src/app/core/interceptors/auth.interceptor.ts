import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      const es401 = error instanceof HttpErrorResponse && error.status === 401;
      const esLoginORefresh = req.url.includes('/token/');

      if (es401 && !esLoginORefresh) {
        return authService.refreshToken().pipe(
          switchMap((nuevoToken) => {
            const reintento = req.clone({ setHeaders: { Authorization: `Bearer ${nuevoToken}` } });
            return next(reintento);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};