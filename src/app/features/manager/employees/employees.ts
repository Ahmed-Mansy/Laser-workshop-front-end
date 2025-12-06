import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AddEmployeeComponent } from '../add-employee/add-employee';

@Component({
    selector: 'app-employees',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './employees.html',
    styleUrl: './employees.css'
})
export class EmployeesComponent implements OnInit {
    private userService = inject(UserService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    employees: User[] = [];
    isLoading = false;

    ngOnInit(): void {
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.isLoading = true;
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.employees = users;
                this.isLoading = false;
                console.log('Loaded employees:', users);
            },
            error: (error) => {
                console.error('Error loading employees:', error);
                this.isLoading = false;
                this.snackBar.open('Failed to load employees', 'Close', { duration: 3000 });
            }
        });
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
                this.snackBar.open('Employee added successfully!', 'Close', { duration: 3000 });
            }
        });
    }

    deleteEmployee(employee: User): void {
        if (confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
            this.userService.deleteUser(employee.id).subscribe({
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
