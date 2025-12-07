import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShiftService } from '../../../core/services/shift.service';
import { Shift } from '../../../core/models/shift.model';
import { OrderDetailsComponent } from '../order-details/order-details';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
    selector: 'app-shift-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatDialogModule,
        TranslatePipe
    ],
    templateUrl: './shift-details.html',
    styleUrl: './shift-details.css'
})
export class ShiftDetailsComponent implements OnInit {
    private shiftService = inject(ShiftService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    shift = signal<Shift | null>(null);
    deliveredOrders = signal<any[]>([]);
    isLoading = signal(true);
    displayedColumns: string[] = ['id', 'customer_name', 'customer_phone', 'price', 'delivered_at', 'actions'];

    ngOnInit(): void {
        const shiftId = Number(this.route.snapshot.paramMap.get('id'));
        if (shiftId) {
            this.loadShiftDetails(shiftId);
        }
    }

    loadShiftDetails(shiftId: number): void {
        this.isLoading.set(true);

        // Load shift info
        this.shiftService.getShiftById(shiftId).subscribe({
            next: (shift) => {
                this.shift.set(shift);
            },
            error: () => {
                this.router.navigate(['/manager/shift-history']);
            }
        });

        // Load delivered orders
        this.shiftService.getDeliveredOrders(shiftId).subscribe({
            next: (orders) => {
                this.deliveredOrders.set(orders);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    viewOrderDetails(order: any): void {
        this.dialog.open(OrderDetailsComponent, {
            width: '800px',
            maxHeight: '90vh',
            panelClass: 'custom-dialog-container',
            data: order
        });
    }

    goBack(): void {
        this.router.navigate(['/manager/shift-history']);
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
