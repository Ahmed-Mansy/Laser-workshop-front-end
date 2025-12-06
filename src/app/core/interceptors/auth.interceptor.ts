import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getAccessToken();

    // Clone request and add authorization header if token exists
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error) => {
            // If 401 error and we have a refresh token, try to refresh
            if (error.status === 401 && authService.getRefreshToken()) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Retry original request with new token
                        const newToken = authService.getAccessToken();
                        const newReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(newReq);
                    }),
                    catchError((refreshError) => {
                        // Refresh failed, logout user
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
