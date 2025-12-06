import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isManager()) {
        return true;
    }

    // Redirect to appropriate page
    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
    } else {
        router.navigate(['/worker']);  // Redirect to worker dashboard if not manager
    }

    return false;
};

export const workerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isWorker()) {
        return true;
    }

    // Redirect to appropriate page
    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
    } else {
        router.navigate(['/manager']);  // Redirect to manager dashboard if not worker
    }

    return false;
};
