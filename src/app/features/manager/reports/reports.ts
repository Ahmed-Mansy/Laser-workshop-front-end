import { Component, OnInit, inject } from '@angular/core';
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

    // Daily Report
    selectedDate: string = '';
    dailyReport: DailyReport | null = null;
    isLoadingDaily = false;

    // Monthly Report
    selectedYear: number = new Date().getFullYear();
    selectedMonth: number = new Date().getMonth() + 1;
    monthlyReport: MonthlyReport | null = null;
    isLoadingMonthly = false;

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

    ngOnInit(): void {
        // Set today's date for daily report
        this.selectedDate = new Date().toISOString().split('T')[0];

        // Generate years from 2020 to current year + 1
        const currentYear = new Date().getFullYear();
        for (let year = 2020; year <= currentYear + 1; year++) {
            this.years.push(year);
        }

        this.loadDailyReport();
        this.loadMonthlyReport();
    }

    loadDailyReport(): void {
        this.isLoadingDaily = true;
        this.reportService.getDailyReport(this.selectedDate).subscribe({
            next: (report) => {
                this.dailyReport = report;
                this.isLoadingDaily = false;
            },
            error: () => {
                this.isLoadingDaily = false;
            }
        });
    }

    loadMonthlyReport(): void {
        this.isLoadingMonthly = true;
        this.reportService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
            next: (report) => {
                this.monthlyReport = report;
                this.isLoadingMonthly = false;
            },
            error: () => {
                this.isLoadingMonthly = false;
            }
        });
    }

    onDateChange(): void {
        this.loadDailyReport();
    }

    onMonthYearChange(): void {
        this.loadMonthlyReport();
    }
}
