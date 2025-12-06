import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../../core/services/order.service';
import { ShiftService } from '../../../core/services/shift.service';
import { Order } from '../../../core/models/order.model';
import { Shift } from '../../../core/models/shift.model';
import { AddOrderComponent } from '../add-order/add-order';
import { OrderDetailsComponent } from '../order-details/order-details';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private shiftService = inject(ShiftService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'customer_name', 'customer_phone', 'status', 'price', 'created_at', 'actions'];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = true;
  selectedStatus: string | null = null;
  searchTerm: string = '';
  currentShift: Shift | null = null;
  hasActiveShift = false;
  isCheckingShift = true;

  ngOnInit(): void {
    this.checkShift();
  }

  checkShift(): void {
    this.isCheckingShift = true;
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift = shift;
        this.hasActiveShift = shift ? shift.is_active : false;
        this.isCheckingShift = false;

        if (this.hasActiveShift) {
          this.loadOrders();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.currentShift = null;
        this.hasActiveShift = false;
        this.isCheckingShift = false;
        this.isLoading = false;
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.results || response;
        this.filteredOrders = this.orders;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
      }
    });
  }

  filterOrders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = this.orders;
    } else {
      const searchLower = this.searchTerm.trim().toLowerCase();
      this.filteredOrders = this.orders.filter(order =>
        order.customer_phone.toLowerCase().includes(searchLower)
      );
    }
  }

  loadCurrentShift(): void {
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift = shift;
      },
      error: () => {
        this.currentShift = null;
      }
    });
  }

  getOrdersByStatus(status: string): Order[] {
    const filteredByStatus = this.filteredOrders.filter(order => order.status === status);

    // For DELIVERED status, only show orders delivered in current shift
    if (status === 'DELIVERED' && this.currentShift) {
      return filteredByStatus.filter(order => {
        if (!order.delivered_at) return false;
        const deliveredDate = new Date(order.delivered_at);
        const shiftStart = new Date(this.currentShift!.opened_at);
        return deliveredDate >= shiftStart;
      });
    }

    return filteredByStatus;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  clearStatusFilter(): void {
    this.selectedStatus = null;
  }

  openOrderDetails(order: Order): void {
    this.dialog.open(OrderDetailsComponent, {
      width: '800px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: order
    });
  }

  openAddOrderDialog(): void {
    const dialogRef = this.dialog.open(AddOrderComponent, {
      width: '650px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders();
      }
    });
  }

  openEditOrderDialog(order: Order): void {
    const dialogRef = this.dialog.open(AddOrderComponent, {
      width: '650px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: order
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders();
      }
    });
  }

  advanceOrderStatus(order: Order): void {
    const statusFlow = ['UNDER_WORK', 'DESIGNING', 'DESIGN_COMPLETED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(order.status);

    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      this.snackBar.open('Order is already at final stage', 'Close', { duration: 3000 });
      return;
    }

    const nextStatus = statusFlow[currentIndex + 1] as 'UNDER_WORK' | 'DESIGNING' | 'DESIGN_COMPLETED' | 'DELIVERED';

    // Use dedicated status update endpoint (works for both managers and workers)
    this.orderService.updateOrderStatus(order.id, { status: nextStatus }).subscribe({
      next: () => {
        this.snackBar.open('Order status updated successfully!', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: () => {
        this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
          this.loadOrders();
        },
        error: () => {
          this.snackBar.open('Error deleting order', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'UNDER_WORK': 'primary',
      'DESIGNING': 'accent',
      'DESIGN_COMPLETED': 'warn',
      'DELIVERED': ''
    };
    return colors[status] || '';
  }
}
