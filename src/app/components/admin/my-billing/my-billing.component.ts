import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TenantBillingService, TenantInvoice, TenantBillingStats, BillingSummary } from '../../../services/tenant-billing.service';

@Component({
  selector: 'app-my-billing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './my-billing.component.html',
  styleUrl: './my-billing.component.css'
})
export class MyBillingComponent implements OnInit {
  invoices: TenantInvoice[] = [];
  stats: TenantBillingStats = {
    total_invoices: 0,
    pending_count: 0,
    paid_count: 0,
    overdue_count: 0,
    total_commissions: 0,
    paid_commissions: 0,
    pending_commissions: 0
  };
  summary: BillingSummary | null = null;
  loading = true;
  displayedColumns: string[] = [
    'invoice_number',
    'period',
    'total_appointments',
    'total_revenue',
    'commission_amount',
    'status',
    'due_date'
  ];

  constructor(
    private tenantBillingService: TenantBillingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Cargar facturas
    this.tenantBillingService.getMyInvoices().subscribe({
      next: (response) => {
        this.invoices = response.invoices;
        this.stats = response.stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando facturas:', error);
        this.snackBar.open('Error al cargar facturas', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });

    // Cargar resumen
    this.tenantBillingService.getBillingSummary().subscribe({
      next: (response) => {
        this.summary = response;
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'PENDIENTE',
      'paid': 'PAGADA',
      'overdue': 'VENCIDA',
      'cancelled': 'CANCELADA'
    };
    return labels[status] || status.toUpperCase();
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'paid': 'status-paid',
      'overdue': 'status-overdue',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return `$${parseFloat(amount as any).toFixed(2)}`;
  }

  getCommissionPercentage(): number {
    if (!this.summary?.tenant?.commission_rate) return 5;
    return parseFloat(this.summary.tenant.commission_rate as any) * 100;
  }
}
