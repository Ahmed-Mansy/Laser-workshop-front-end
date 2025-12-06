import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
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
    private updateSubject = new BehaviorSubject<RealTimeUpdate | null>(null);
    public updates$: Observable<RealTimeUpdate | null> = this.updateSubject.asObservable();

    private pollingSubscription?: Subscription;
    private isPolling = false;
    private pollingInterval = 3000; // 3 seconds
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
        this.pollingSubscription = interval(this.pollingInterval)
            .pipe(
                switchMap(() => this.checkForUpdates()),
                catchError(error => {
                    console.error('Polling error:', error);
                    return of(null);
                })
            )
            .subscribe(update => {
                if (update) {
                    this.updateSubject.next(update);
                }
            });
    }

    /**
     * Stop polling for updates
     */
    stopPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = undefined;
        }
        this.isPolling = false;
    }

    /**
     * Check for updates from backend
     */
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

                                if (hasUpdates) {
                                    observer.next({
                                        type: 'order',
                                        timestamp: now,
                                        data: response.results
                                    });
                                }
                            }
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
                this.updateSubject.next(update);
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
