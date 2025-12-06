import { Component, inject, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css'
})
export class AddOrderComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AddOrderComponent>);

  orderForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  isEditMode: boolean = false;
  orderId?: number;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: Order) {
    this.isEditMode = !!data;
    this.orderId = data?.id;

    this.orderForm = this.fb.group({
      customer_name: [data?.customer_name || '', [Validators.required]],
      customer_phone: [data?.customer_phone || '', [Validators.required]],
      order_details: [data?.order_details || '', [Validators.required]],
      status: [data?.status || 'UNDER_WORK'],
      price: [data?.price || '']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;

      const formValue = this.orderForm.value;
      const orderData: any = {
        customer_name: formValue.customer_name,
        customer_phone: formValue.customer_phone,
        order_details: formValue.order_details,
        status: formValue.status
      };

      // Only include price if it has a value
      if (formValue.price) {
        orderData.price = parseFloat(formValue.price);
      }

      if (this.selectedFile) {
        orderData.image = this.selectedFile;
      }

      const operation = this.isEditMode && this.orderId
        ? this.orderService.updateOrder(this.orderId, orderData)
        : this.orderService.createOrder(orderData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          const message = this.isEditMode ? 'Order updated successfully!' : 'Order created successfully!';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          const message = this.isEditMode ? 'Failed to update order' : 'Failed to create order';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
