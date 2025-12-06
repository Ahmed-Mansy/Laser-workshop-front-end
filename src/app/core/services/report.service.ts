import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyReport, MonthlyReport } from '../models/report.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/reports`;

    /**
     * Get daily financial report
     * @param date Date in YYYY-MM-DD format (optional, defaults to today)
     */
    getDailyReport(date?: string): Observable<DailyReport> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', date);
        }

        return this.http.get<DailyReport>(`${this.apiUrl}/daily/`, { params });
    }

    /**
     * Get monthly financial report
     * @param year Year (optional, defaults to current year)
     * @param month Month 1-12 (optional, defaults to current month)
     */
    getMonthlyReport(year?: number, month?: number): Observable<MonthlyReport> {
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        if (month) params = params.set('month', month.toString());

        return this.http.get<MonthlyReport>(`${this.apiUrl}/monthly/`, { params });
    }
}
