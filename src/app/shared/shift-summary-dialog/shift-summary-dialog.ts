import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface ShiftSummary {
    shift_id: number;
    opened_at: string;
    closed_at: string;
    duration_hours: number;
    total_orders_delivered: number;
    total_revenue: number;
    message?: string;
}

@Component({
    selector: 'app-shift-summary-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
    templateUrl: './shift-summary-dialog.html',
    styleUrl: './shift-summary-dialog.css'
})
export class ShiftSummaryDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ShiftSummaryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { shift: any; summary: any }
    ) {
        console.log('Shift Data:', this.data.shift);
        console.log('Summary Data:', this.data.summary);
    }

    close(): void {
        this.dialogRef.close();
    }
}
