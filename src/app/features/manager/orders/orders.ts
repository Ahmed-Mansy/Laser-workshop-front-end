import { Component, OnInit, inject, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';
import { ShiftService } from '../../../core/services/shift.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { LanguageService } from '../../../core/services/language.service';
import { Order } from '../../../core/models/order.model';
import { Shift } from '../../../core/models/shift.model';
import { AddOrderComponent } from '../add-order/add-order';
import { OrderDetailsComponent } from '../order-details/order-details';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

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
    MatDialogModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private shiftService = inject(ShiftService);
  private websocketService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);
  private languageService = inject(LanguageService);

  displayedColumns: string[] = ['id', 'customer_name', 'customer_phone', 'status', 'price', 'created_at', 'actions'];

  // Convert all state to signals
  orders = signal<Order[]>([]);
  isLoading = signal(true);
  selectedStatus = signal<string | null>(null);
  searchTerm = signal('');
  currentShift = signal<Shift | null>(null);
  hasActiveShift = signal(false);
  isCheckingShift = signal(true);

  // Computed signals for derived state
  filteredOrders = computed(() => {
    const search = this.searchTerm();
    const allOrders = this.orders();

    if (!search.trim()) {
      return allOrders;
    }

    const searchLower = search.trim().toLowerCase();
    return allOrders.filter(order =>
      order.customer_phone.toLowerCase().includes(searchLower)
    );
  });

  constructor() {
    // WebSocket effect for instant order updates
    effect(() => {
      const update = this.websocketService.orderUpdate();
      if (update) {
        // Run inside Angular zone for proper change detection
        this.ngZone.run(() => {
          this.loadOrdersQuietly();
        });
      }
    });

    // WebSocket effect for shift updates
    effect(() => {
      const update = this.websocketService.shiftUpdate();
      if (update) {
        this.checkShift();
      }
    });

    // Auto-connect to WebSocket
    this.websocketService.connect();
  }

  ngOnInit(): void {
    this.checkShift();
    // WebSocket handles real-time updates automatically
  }

  checkShift(): void {
    this.isCheckingShift.set(true);
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift.set(shift);
        this.hasActiveShift.set(shift ? shift.is_active : false);
        this.isCheckingShift.set(false);

        if (this.hasActiveShift()) {
          this.loadOrders();
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.currentShift.set(null);
        this.hasActiveShift.set(false);
        this.isCheckingShift.set(false);
        this.isLoading.set(false);
      }
    });
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders.set(response.results || response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open(this.languageService.translate('messages.errorLoadingOrders'), this.languageService.translate('common.close'), { duration: 3000 });
      }
    });
  }

  loadOrdersQuietly(): void {
    // Load orders without showing the loading spinner (for real-time updates)
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders.set(response.results || response);
      },
      error: () => {
        // Silently fail for background updates
      }
    });
  }

  loadCurrentShift(): void {
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift.set(shift);
      },
      error: () => {
        this.currentShift.set(null);
      }
    });
  }

  getOrdersByStatus(status: string | null): Order[] {
    if (!status) return [];

    const filteredByStatus = this.filteredOrders().filter(order => order.status === status);

    // For DELIVERED status, only show orders delivered in current shift
    const shift = this.currentShift();
    if (status === 'DELIVERED' && shift) {
      return filteredByStatus.filter(order => {
        if (!order.delivered_at) return false;
        const deliveredDate = new Date(order.delivered_at);
        const shiftStart = new Date(shift.opened_at);
        return deliveredDate >= shiftStart;
      });
    }

    return filteredByStatus;
  }

  selectStatus(status: string): void {
    this.selectedStatus.set(status);
  }

  clearStatusFilter(): void {
    this.selectedStatus.set(null);
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
      this.snackBar.open(this.languageService.translate('messages.orderFinalStage'), this.languageService.translate('common.close'), { duration: 3000 });
      return;
    }

    const nextStatus = statusFlow[currentIndex + 1] as 'UNDER_WORK' | 'DESIGNING' | 'DESIGN_COMPLETED' | 'DELIVERED';

    // Use dedicated status update endpoint (works for both managers and workers)
    this.orderService.updateOrderStatus(order.id, { status: nextStatus }).subscribe({
      next: () => {
        this.snackBar.open(this.languageService.translate('messages.orderStatusUpdated'), this.languageService.translate('common.close'), { duration: 3000 });
        this.loadOrders();
      },
      error: () => {
        this.snackBar.open(this.languageService.translate('messages.errorUpdatingStatus'), this.languageService.translate('common.close'), { duration: 3000 });
      }
    });
  }

  deleteOrder(id: number): void {
    if (confirm(this.languageService.translate('messages.deleteOrderConfirm'))) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.snackBar.open(this.languageService.translate('messages.orderDeleted'), this.languageService.translate('common.close'), { duration: 3000 });
          this.loadOrders();
        },
        error: () => {
          this.snackBar.open(this.languageService.translate('messages.errorDeletingOrder'), this.languageService.translate('common.close'), { duration: 3000 });
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
