import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private requestCount = 0;
    private hideTimeout: any;

    show(): void {
        // Clear any pending hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.requestCount++;
        this.loadingSubject.next(true);
    }

    hide(): void {
        this.requestCount--;
        if (this.requestCount <= 0) {
            this.requestCount = 0;

            // Add 1-second delay before hiding
            this.hideTimeout = setTimeout(() => {
                this.loadingSubject.next(false);
            }, 1000);
        }
    }
}
