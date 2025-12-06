import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportService } from '../../../core/services/report.service';
import { DailyReport, MonthlyReport } from '../../../core/models/report.model';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTabsModule
    ],
    templateUrl: './reports.html',
    styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {
    private reportService = inject(ReportService);

    // Convert all state to signals
    selectedDate = signal(new Date().toISOString().split('T')[0]);
    dailyReport = signal<DailyReport | null>(null);
    isLoadingDaily = signal(false);

    selectedYear = signal(new Date().getFullYear());
    selectedMonth = signal(new Date().getMonth() + 1);
    monthlyReport = signal<MonthlyReport | null>(null);
    isLoadingMonthly = signal(false);

    years: number[] = [];
    months = [
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];

    constructor() {
        // Effect: Auto-load daily report when date changes
        effect(() => {
            const date = this.selectedDate();
            this.loadDailyReport(date);
        });

        // Effect: Auto-load monthly report when year/month changes
        effect(() => {
            const year = this.selectedYear();
            const month = this.selectedMonth();
            this.loadMonthlyReport(year, month);
        });
    }

    ngOnInit(): void {
        // Generate years from 2020 to current year + 1
        const currentYear = new Date().getFullYear();
        for (let year = 2020; year <= currentYear + 1; year++) {
            this.years.push(year);
        }
    }

    private loadDailyReport(date: string): void {
        this.isLoadingDaily.set(true);
        this.reportService.getDailyReport(date).subscribe({
            next: (report) => {
                this.dailyReport.set(report);
                this.isLoadingDaily.set(false);
            },
            error: () => {
                this.isLoadingDaily.set(false);
            }
        });
    }

    private loadMonthlyReport(year: number, month: number): void {
        this.isLoadingMonthly.set(true);
        this.reportService.getMonthlyReport(year, month).subscribe({
            next: (report) => {
                this.monthlyReport.set(report);
                this.isLoadingMonthly.set(false);
            },
            error: () => {
                this.isLoadingMonthly.set(false);
            }
        });
    }
}
