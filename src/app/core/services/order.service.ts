import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderCreate, OrderUpdate, OrderStatusUpdate, OrderStatistics } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/orders`;

    /**
     * Get all orders with optional filters
     */
    getOrders(params?: any): Observable<any> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }

        return this.http.get<any>(this.apiUrl + '/', { params: httpParams });
    }

    /**
     * Get single order by ID
     */
    getOrder(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}/`);
    }

    /**
     * Create new order
     */
    createOrder(order: OrderCreate): Observable<Order> {
        const formData = this.createFormData(order);
        return this.http.post<Order>(this.apiUrl + '/', formData);
    }

    /**
     * Update order (Manager: all fields, Worker: status only via updateStatus)
     */
    updateOrder(id: number, order: OrderUpdate): Observable<Order> {
        const formData = this.createFormData(order);
        return this.http.patch<Order>(`${this.apiUrl}/${id}/`, formData);
    }

    /**
     * Update only order status (for workers)
     */
    updateOrderStatus(id: number, status: OrderStatusUpdate): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/${id}/update_status/`, status);
    }

    /**
     * Delete order (Manager only)
     */
    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}/`);
    }

    /**
     * Track order by ID (Public)
     */
    trackOrder(id: any): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/track/`);
    }

    /**
     * Get order statistics (Manager only)
     */
    getStatistics(month?: number, year?: number): Observable<OrderStatistics> {
        let params = new HttpParams();
        if (month) params = params.set('month', month.toString());
        if (year) params = params.set('year', year.toString());

        return this.http.get<OrderStatistics>(`${this.apiUrl}/statistics/`, { params });
    }

    /**
     * Helper to create FormData from order object
     */
    private createFormData(order: any): FormData {
        const formData = new FormData();

        Object.keys(order).forEach(key => {
            // Always include price field even if null/empty
            if (key === 'price') {
                if (order[key] !== null && order[key] !== undefined && order[key] !== '') {
                    formData.append(key, order[key].toString());
                }
            } else if (order[key] !== null && order[key] !== undefined) {
                if (key === 'image' && order[key] instanceof File) {
                    formData.append(key, order[key], order[key].name);
                } else {
                    formData.append(key, order[key].toString());
                }
            }
        });

        return formData;
    }
}
