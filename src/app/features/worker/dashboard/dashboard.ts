import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  recentOrders: Order[] = [];
  myOrdersCount = 0;
  isLoading = true;

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  loadRecentOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.recentOrders = (response.results || response).slice(0, 5);
        this.myOrdersCount = response.count || response.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
