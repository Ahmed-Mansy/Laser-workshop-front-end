import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { Router } from '@angular/router';

const isRefreshing = signal(false);
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken();

    // Clone request and add authorization header if token exists
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
        req = addToken(req, token);
    }

    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};

const addToken = (req: HttpRequest<any>, token: string) => {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
};

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) => {
    if (!isRefreshing()) {
        isRefreshing.set(true);
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((response: any) => {
                isRefreshing.set(false);
                const newToken = response.access;
                // Token is already updated in localStorage by AuthService.refreshToken()
                refreshTokenSubject.next(newToken);
                return next(addToken(req, newToken));
            }),
            catchError((err) => {
                isRefreshing.set(false);
                authService.logout();
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
                return next(addToken(req, jwt as string));
            })
        );
    }
};
