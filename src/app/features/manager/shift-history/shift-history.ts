import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ShiftService } from '../../../core/services/shift.service';
import { Shift } from '../../../core/models/shift.model';

@Component({
    selector: 'app-shift-history',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatChipsModule
    ],
    templateUrl: './shift-history.html',
    styleUrl: './shift-history.css'
})
export class ShiftHistoryComponent implements OnInit {
    private shiftService = inject(ShiftService);
    private router = inject(Router);

    shifts: Shift[] = [];
    isLoading = true;

    ngOnInit(): void {
        this.loadShifts();
    }

    loadShifts(): void {
        this.isLoading = true;
        this.shiftService.getAllShifts().subscribe({
            next: (shifts) => {
                this.shifts = shifts;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    viewShiftDetails(shiftId: number): void {
        this.router.navigate(['/manager/shift-details', shiftId]);
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
