import { Component, OnInit, inject, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/services/order.service';
import { ReportService } from '../../../core/services/report.service';
import { UserService } from '../../../core/services/user.service';
import { ShiftService } from '../../../core/services/shift.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { User } from '../../../core/models/user.model';
import { Shift } from '../../../core/models/shift.model';
import { AddEmployeeComponent } from '../add-employee/add-employee';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ShiftSummaryDialogComponent } from '../../../shared/shift-summary-dialog/shift-summary-dialog';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private reportService = inject(ReportService);
  private userService = inject(UserService);
  private shiftService = inject(ShiftService);
  private websocketService = inject(WebSocketService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private ngZone = inject(NgZone);

  // Convert all state to signals
  private baseStatistics = signal({
    total: 0,
    underWork: 0,
    designing: 0,
    designCompleted: 0
  });

  isLoading = signal(false);
  employees = signal<User[]>([]);
  isLoadingEmployees = signal(false);
  currentShift = signal<Shift | null>(null);
  isLoadingShift = signal(false);

  // Computed values that automatically update!
  statistics = computed(() => {
    const base = this.baseStatistics();
    const shift = this.currentShift();

    return {
      total: base.total,
      underWork: base.underWork,
      designing: base.designing,
      designCompleted: base.designCompleted,
      delivered: (shift?.is_active ? shift.total_orders_delivered : 0)
    };
  });

  todayRevenue = computed(() => {
    const shift = this.currentShift();
    return shift?.is_active ? shift.total_revenue : 0;
  });

  todayOrders = computed(() => {
    const shift = this.currentShift();
    return shift?.is_active ? shift.total_orders_delivered : 0;
  });


  constructor() {
    // WebSocket effect for real-time statistics updates
    effect(() => {
      const update = this.websocketService.orderUpdate();
      if (update) {
        // Run inside Angular zone for proper change detection
        this.ngZone.run(() => {
          this.loadStatistics();
          this.loadCurrentShift(); // Also refresh shift info
        });
      }
    });

    // Auto-connect to WebSocket
    this.websocketService.connect();
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadEmployees();
    this.loadCurrentShift();
  }

  loadStatistics(): void {
    const today = new Date();
    this.orderService.getStatistics(today.getMonth() + 1, today.getFullYear()).subscribe({
      next: (stats) => {
        this.baseStatistics.set({
          total: stats.total,
          underWork: stats.by_status['UNDER_WORK'] || 0,
          designing: stats.by_status['DESIGNING'] || 0,
          designCompleted: stats.by_status['DESIGN_COMPLETED'] || 0
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadEmployees(): void {
    this.isLoadingEmployees.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.employees.set(users);
        this.isLoadingEmployees.set(false);
      },
      error: () => {
        this.isLoadingEmployees.set(false);
      }
    });
  }

  loadCurrentShift(): void {
    this.isLoadingShift.set(true);
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift.set(shift);
        this.isLoadingShift.set(false);
      },
      error: () => {
        this.currentShift.set(null);
        this.isLoadingShift.set(false);
      }
    });
  }

  openNewShift(): void {
    if (confirm('This will close any active shift and open a new one. Continue?')) {
      this.isLoadingShift.set(true);
      this.shiftService.openNewShift().subscribe({
        next: (shift) => {
          this.currentShift.set(shift);
          this.isLoadingShift.set(false);
          this.snackBar.open('New shift opened successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.isLoadingShift.set(false);
          this.snackBar.open('Failed to open new shift', 'Close', { duration: 3000 });
        }
      });
    }
  }

  closeShift(): void {
    const shift = this.currentShift();
    if (!shift) return;

    if (confirm('Close the current shift?')) {
      this.isLoadingShift.set(true);
      this.shiftService.closeShift(shift.id).subscribe({
        next: (response: any) => {
          this.currentShift.set(response.shift);
          this.isLoadingShift.set(false);

          // Open summary dialog with both shift and summary data
          this.dialog.open(ShiftSummaryDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            disableClose: true,
            panelClass: 'custom-dialog-container',
            data: {
              shift: response.shift,
              summary: response.summary
            }
          });

          this.snackBar.open('Shift closed successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.isLoadingShift.set(false);
          this.snackBar.open('Failed to close shift', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openAddEmployeeDialog(): void {
    const dialogRef = this.dialog.open(AddEmployeeComponent, {
      width: '700px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.snackBar.open('Employee deleted successfully!', 'Close', { duration: 3000 });
          this.loadEmployees();
        },
        error: () => {
          this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
