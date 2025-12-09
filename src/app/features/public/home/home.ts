import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ContactDialogComponent } from '../../../shared/contact-dialog/contact-dialog';

import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    TranslatePipe,
    FormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);
  private orderService = inject(OrderService);

  orderId: string = '';
  trackingResult: any = null;
  isLoading = false;
  error: string = '';

  trackOrder() {
    if (!this.orderId) return;

    this.isLoading = true;
    this.error = '';
    this.trackingResult = null;

    this.orderService.trackOrder(this.orderId).subscribe({
      next: (res) => {
        this.trackingResult = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Order not found or invalid ID'; // Simple error for now, could use translation
        this.isLoading = false;
      }
    });
  }


  get features() {
    return [
      {
        icon: 'fa-boxes',
        title: this.languageService.translate('home.features.orderManagement.title'),
        description: this.languageService.translate('home.features.orderManagement.description')
      },
      {
        icon: 'fa-chart-line',
        title: this.languageService.translate('home.features.financialReports.title'),
        description: this.languageService.translate('home.features.financialReports.description')
      },
      {
        icon: 'fa-users',
        title: this.languageService.translate('home.features.teamCollaboration.title'),
        description: this.languageService.translate('home.features.teamCollaboration.description')
      },
      {
        icon: 'fa-images',
        title: this.languageService.translate('home.features.showcaseGallery.title'),
        description: this.languageService.translate('home.features.showcaseGallery.description')
      }
    ];
  }

  openContactDialog(): void {
    this.dialog.open(ContactDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container'
    });
  }
}
