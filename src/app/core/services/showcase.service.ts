import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderShowcase } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShowcaseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/showcase`;

    /**
     * Get all delivered orders for public showcase
     * @param withImage Optional filter to show only orders with images
     */
    getShowcaseOrders(withImage: boolean = false): Observable<any> {
        let httpParams = new HttpParams();
        if (withImage) {
            httpParams = httpParams.set('with_image', 'true');
        }
        return this.http.get<any>(this.apiUrl + '/', { params: httpParams });
    }
}
