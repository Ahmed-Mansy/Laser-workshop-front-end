import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '../../../core/models/order.model';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
    templateUrl: './order-details.html',
    styleUrl: './order-details.css'
})
export class OrderDetailsComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public order: Order,
        private dialogRef: MatDialogRef<OrderDetailsComponent>
    ) { }

    onClose(): void {
        this.dialogRef.close();
    }

    getStatusDisplay(): string {
        const statusMap: { [key: string]: string } = {
            'UNDER_WORK': 'underWork',
            'DESIGNING': 'designing',
            'DESIGN_COMPLETED': 'designCompleted',
            'DONE_CUTTING': 'doneCutting',
            'DELIVERED': 'delivered'
        };
        return statusMap[this.order.status] || this.order.status;
    }

    getStatusColor(): string {
        const colorMap: { [key: string]: string } = {
            'UNDER_WORK': 'laser',
            'DESIGNING': 'fire',
            'DESIGN_COMPLETED': 'spark',
            'DONE_CUTTING': 'blue',
            'DELIVERED': 'green'
        };
        return colorMap[this.order.status] || 'gray';
    }

    getImageUrl(): string {
        if (!this.order.image) return '';
        // If image already has http/https, return as is
        if (this.order.image.startsWith('http')) return this.order.image;
        // Otherwise prepend backend URL from environment
        const baseUrl = environment.apiUrl.replace('/api', ''); // Remove /api suffix
        return `${baseUrl}${this.order.image}`;
    }
}
