import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth/users`;

    /**
     * Get all users (Manager only)
     */
    getUsers(): Observable<User[]> {
        return this.http.get<any>(`${this.apiUrl}/`).pipe(
            map(response => response.results || response)
        );
    }

    /**
     * Get single user by ID
     */
    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}/`);
    }

    /**
     * Update user (Manager only)
     */
    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}/`, user);
    }

    /**
     * Delete user (Manager only)
     */
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}/`);
    }
}
