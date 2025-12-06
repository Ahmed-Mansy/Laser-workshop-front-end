import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'current_user';

    constructor() {
        // Load user from localStorage on init
        const storedUser = localStorage.getItem(this.USER_KEY);
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    /**
     * Login user and store tokens
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login/`, credentials)
            .pipe(
                tap(response => {
                    this.setTokens(response.access, response.refresh);
                    this.setCurrentUser(response.user);
                })
            );
    }

    /**
     * Register new user
     */
    register(userData: RegisterRequest): Observable<User> {
        return this.http.post<User>(`${environment.apiUrl}/auth/register/`, userData);
    }

    /**
     * Logout user and clear tokens
     */
    logout(): void {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            this.http.post(`${environment.apiUrl}/auth/logout/`, { refresh_token: refreshToken })
                .subscribe();
        }

        this.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Get current user information from server
     */
    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${environment.apiUrl}/auth/me/`)
            .pipe(
                tap(user => this.setCurrentUser(user))
            );
    }

    /**
     * Refresh access token
     */
    refreshToken(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        return this.http.post(`${environment.apiUrl}/auth/token/refresh/`, { refresh: refreshToken })
            .pipe(
                tap((response: any) => {
                    this.setAccessToken(response.access);
                })
            );
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    /**
     * Check if current user is a manager
     */
    isManager(): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === 'MANAGER';
    }

    /**
     * Check if current user is a worker
     */
    isWorker(): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === 'WORKER';
    }

    /**
     * Get user role
     */
    getUserRole(): 'MANAGER' | 'WORKER' | null {
        return this.currentUserSubject.value?.role || null;
    }

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Set access token
     */
    private setAccessToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /**
     * Set both tokens
     */
    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Clear all tokens and user data
     */
    private clearTokens(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * Set current user
     */
    private setCurrentUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }
}
