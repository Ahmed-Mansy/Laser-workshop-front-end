import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { managerGuard, workerGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // Public routes
    {
        path: '', title: 'Laser-Workshop',
        loadComponent: () => import('./features/public/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'showcase', title: 'showcase',
        loadComponent: () => import('./features/public/showcase/showcase').then(m => m.ShowcaseComponent)
    },
    {
        path: 'login', title: 'login',
        canActivate: [loginGuard],
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    },

    // Manager routes (protected)
    {
        path: 'manager',
        canActivate: [authGuard, managerGuard],
        children: [
            {
                path: '', title: 'Dashboard',
                loadComponent: () => import('./features/manager/dashboard/dashboard').then(m => m.DashboardComponent)
            },
            {
                path: 'orders', title: 'Orders',
                loadComponent: () => import('./features/manager/orders/orders').then(m => m.OrdersComponent)
            },
            {
                path: 'employees', title: 'Employees',
                loadComponent: () => import('./features/manager/employees/employees').then(m => m.EmployeesComponent)
            },
            {
                path: 'reports', title: 'Reports',
                loadComponent: () => import('./features/manager/reports/reports').then(m => m.ReportsComponent)
            },
            {
                path: 'shift-history', title: 'Shift-History',
                loadComponent: () => import('./features/manager/shift-history/shift-history').then(m => m.ShiftHistoryComponent)
            },
            {
                path: 'shift-details/:id', title: 'Shift-Details',
                loadComponent: () => import('./features/manager/shift-details/shift-details').then(m => m.ShiftDetailsComponent)
            }
        ]
    },

    // Worker routes (protected) - Only orders page
    {
        path: 'worker',
        canActivate: [authGuard, workerGuard],
        children: [
            {
                path: '',
                redirectTo: 'orders',
                pathMatch: 'full'
            },
            {
                path: 'orders', title: 'Orders',
                loadComponent: () => import('./features/manager/orders/orders').then(m => m.OrdersComponent)
            }
        ]
    },

    // Redirect unknown routes
    {
        path: '**',
        redirectTo: ''
    }
];
