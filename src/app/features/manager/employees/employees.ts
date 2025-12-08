import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AddEmployeeComponent } from '../add-employee/add-employee';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';

@Component({
    selector: 'app-employees',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslatePipe
    ],
    templateUrl: './employees.html',
    styleUrl: './employees.css'
})
export class EmployeesComponent implements OnInit {
    private userService = inject(UserService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private languageService = inject(LanguageService);

    // Convert to signals
    employees = signal<User[]>([]);
    isLoading = signal(false);

    ngOnInit(): void {
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.isLoading.set(true);
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.employees.set(users);
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading employees:', error);
                this.isLoading.set(false);
                this.snackBar.open(this.languageService.translate('messages.errorLoadingEmployees'), this.languageService.translate('common.close'), { duration: 3000 });
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
                this.snackBar.open(this.languageService.translate('messages.employeeAdded'), this.languageService.translate('common.close'), { duration: 3000 });
            }
        });
    }

    deleteEmployee(employee: User): void {
        const confirmMessage = this.languageService.translate('messages.deleteEmployeeConfirm', { name: `${employee.first_name} ${employee.last_name}` });
        if (confirm(confirmMessage)) {
            this.userService.deleteUser(employee.id).subscribe({
                next: () => {
                    this.snackBar.open(this.languageService.translate('messages.employeeDeleted'), this.languageService.translate('common.close'), { duration: 3000 });
                    this.loadEmployees();
                },
                error: () => {
                    this.snackBar.open(this.languageService.translate('messages.errorDeletingEmployee'), this.languageService.translate('common.close'), { duration: 3000 });
                }
            });
        }
    }
}
