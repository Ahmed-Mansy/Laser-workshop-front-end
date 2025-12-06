import { Component, OnInit, inject } from '@angular/core';
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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  statistics = {
    total: 0,
    underWork: 0,
    designing: 0,
    designCompleted: 0,
    delivered: 0
  };

  todayRevenue = 0;
  todayOrders = 0;
  isLoading = false;
  employees: User[] = [];
  isLoadingEmployees = false;

  // Shift management
  currentShift: Shift | null = null;
  isLoadingShift = false;

  ngOnInit(): void {
    this.loadStatistics();
    this.loadTodayReport();
    this.loadEmployees();
    this.loadCurrentShift();
  }

  loadStatistics(): void {
    const today = new Date();
    this.orderService.getStatistics(today.getMonth() + 1, today.getFullYear()).subscribe({
      next: (stats) => {
        this.statistics.total = stats.total;
        this.statistics.underWork = stats.by_status['UNDER_WORK'] || 0;
        this.statistics.designing = stats.by_status['DESIGNING'] || 0;
        this.statistics.designCompleted = stats.by_status['DESIGN_COMPLETED'] || 0;

        // Don't set delivered here - we'll get it from the shift
        this.isLoading = false;
        this.updateShiftBasedStatistics();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateShiftBasedStatistics(): void {
    // Update delivered count and revenue based on current shift
    if (this.currentShift && this.currentShift.is_active) {
      this.statistics.delivered = this.currentShift.total_orders_delivered;
      this.todayRevenue = this.currentShift.total_revenue;
      this.todayOrders = this.currentShift.total_orders_delivered;
    } else {
      // No active shift - show zeros
      this.statistics.delivered = 0;
      this.todayRevenue = 0;
      this.todayOrders = 0;
    }
  }

  loadTodayReport(): void {
    // We now use shift data for today's stats instead of daily report
    // This method is called but does nothing - stats come from shift
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.employees = users;
        this.isLoadingEmployees = false;
      },
      error: () => {
        this.isLoadingEmployees = false;
      }
    });
  }

  loadCurrentShift(): void {
    this.isLoadingShift = true;
    this.shiftService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift = shift;
        this.isLoadingShift = false;
        this.updateShiftBasedStatistics();
      },
      error: () => {
        // Error getting shift
        this.currentShift = null;
        this.isLoadingShift = false;
        this.updateShiftBasedStatistics();
      }
    });
  }

  openNewShift(): void {
    if (confirm('This will close any active shift and open a new one. Continue?')) {
      this.isLoadingShift = true;
      this.shiftService.openNewShift().subscribe({
        next: (shift) => {
          this.currentShift = shift;
          this.isLoadingShift = false;
          this.updateShiftBasedStatistics();
          this.snackBar.open('New shift opened successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.isLoadingShift = false;
          this.snackBar.open('Failed to open new shift', 'Close', { duration: 3000 });
        }
      });
    }
  }

  closeShift(): void {
    if (!this.currentShift) return;

    if (confirm('Close the current shift?')) {
      this.isLoadingShift = true;
      this.shiftService.closeShift(this.currentShift.id).subscribe({
        next: (response: any) => {
          this.currentShift = response.shift;
          this.isLoadingShift = false;
          this.updateShiftBasedStatistics();

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
          this.isLoadingShift = false;
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
