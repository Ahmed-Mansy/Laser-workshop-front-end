import { Injectable, OnDestroy, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RealTimeUpdate {
    type: 'order' | 'shift';
    timestamp: Date;
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class RealTimeService implements OnDestroy {
    // Convert from BehaviorSubject to Signal
    readonly updates = signal<RealTimeUpdate | null>(null);
    readonly lastUpdateTime = signal<Date | null>(null);

    private pollingIntervalId?: any;
    private isPolling = false;
    private pollingInterval = 10000; // 10 seconds - reduced frequency to avoid constant refreshes
    private lastOrderCheck?: Date;
    private lastShiftCheck?: Date;

    constructor(private http: HttpClient) {
        // Start polling when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !this.isPolling) {
                this.startPolling();
            } else if (document.visibilityState === 'hidden') {
                this.stopPolling();
            }
        });
    }

    /**
     * Start polling for updates
     */
    startPolling(): void {
        if (this.isPolling) return;

        this.isPolling = true;

        // Use setInterval instead of RxJS interval
        this.pollingIntervalId = setInterval(() => {
            this.checkForUpdates().subscribe({
                next: (update) => {
                    if (update) {
                        this.updates.set(update);
                        this.lastUpdateTime.set(new Date());
                    }
                },
                error: (error) => {
                    console.error('Polling error:', error);
                }
            });
        }, this.pollingInterval);

        // Do initial check immediately
        this.checkForUpdates().subscribe({
            next: (update) => {
                if (update) {
                    this.updates.set(update);
                    this.lastUpdateTime.set(new Date());
                }
            }
        });
    }

    /**
     * Stop polling for updates
     */
    stopPolling(): void {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = undefined;
        }
        this.isPolling = false;
    }

    private checkForUpdates(): Observable<RealTimeUpdate | null> {
        const params: any = {};

        if (this.lastOrderCheck) {
            params.since = this.lastOrderCheck.toISOString();
        }

        return new Observable(observer => {
            // Check for order updates
            this.http.get<any>(`${environment.apiUrl}/orders/orders/`, { params })
                .subscribe({
                    next: (response) => {
                        const now = new Date();

                        // Check if there are any new or updated orders
                        if (response.results && response.results.length > 0) {
                            if (this.lastOrderCheck) {
                                // Check if any order was updated after our last check
                                const hasUpdates = response.results.some((order: any) => {
                                    const updatedAt = new Date(order.updated_at || order.created_at);
                                    return this.lastOrderCheck && updatedAt > this.lastOrderCheck;
                                });

                                // Only notify if there are actual updates
                                if (hasUpdates) {
                                    observer.next({
                                        type: 'order',
                                        timestamp: now,
                                        data: response.results
                                    });
                                } else {
                                    // No updates, complete without notifying
                                    observer.next(null);
                                }
                            } else {
                                // First check, don't notify
                                observer.next(null);
                            }
                        } else {
                            observer.next(null);
                        }

                        this.lastOrderCheck = now;
                        observer.complete();
                    },
                    error: (error) => {
                        console.error('Error checking for updates:', error);
                        observer.next(null);
                        observer.complete();
                    }
                });
        });
    }

    /**
     * Force an immediate check for updates
     */
    forceCheck(): void {
        this.checkForUpdates().subscribe(update => {
            if (update) {
                this.updates.set(update);
                this.lastUpdateTime.set(new Date());
            }
        });
    }

    /**
     * Reset the last check time (useful after manual refresh)
     */
    resetCheckTime(): void {
        this.lastOrderCheck = new Date();
        this.lastShiftCheck = new Date();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }
}
