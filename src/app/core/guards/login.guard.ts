import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent authenticated users from accessing login page
 * Redirects to appropriate dashboard based on user role
 */
export const loginGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If user is already logged in, redirect to their dashboard
    if (authService.isAuthenticated()) {
        // Get user from localStorage
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
            const user = JSON.parse(userStr);

            // Redirect based on role
            if (user.role === 'MANAGER') {
                router.navigate(['/manager']);
            } else if (user.role === 'WORKER') {
                router.navigate(['/worker']);
            } else {
                router.navigate(['/']);
            }
        } else {
            router.navigate(['/']);
        }

        return false;
    }

    // Allow access to login page if not authenticated
    return true;
};
