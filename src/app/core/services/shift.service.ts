import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Shift } from '../models/shift.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/orders/shifts`;

    /**
     * Get current active shift
     * Returns null if no active shift (404 is expected and handled silently)
     */
    getCurrentShift(): Observable<Shift | null> {
        return this.http.get<Shift>(`${this.apiUrl}/current/`).pipe(
            catchError((error) => {
                // 404 is expected when no shift is active - handle silently
                if (error.status === 404) {
                    return of(null);
                }
                // Re-throw other errors
                throw error;
            })
        );
    }

    /**
     * Open a new shift (auto-closes any active shift)
     */
    openNewShift(): Observable<Shift> {
        return this.http.post<Shift>(`${this.apiUrl}/open_new/`, {});
    }

    /**
     * Close a specific shift
     */
    closeShift(id: number): Observable<Shift> {
        return this.http.post<Shift>(`${this.apiUrl}/${id}/close/`, {});
    }

    /**
     * Get all shifts (history)
     */
    getAllShifts(): Observable<Shift[]> {
        return this.http.get<any>(`${this.apiUrl}/`).pipe(
            map(response => response.results || response)
        );
    }

    /**
     * Get a specific shift by ID
     */
    getShiftById(id: number): Observable<Shift> {
        return this.http.get<Shift>(`${this.apiUrl}/${id}/`);
    }

    /**
     * Get all delivered orders for a specific shift
     */
    getDeliveredOrders(shiftId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${shiftId}/delivered_orders/`);
    }
}
