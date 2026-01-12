import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BillingService } from '../../../services/billing.service';
import { BillingInvoice, BillingStats } from '../../../models/tenant.model';

@Component({
  selector: 'app-billing-list',
  templateUrl: './billing-list.component.html',
  styleUrls: ['./billing-list.component.css']
})
export class BillingListComponent implements OnInit {
  displayedColumns: string[] = [
    'invoice_number',
    'tenant',
    'period',
    'appointments',
    'revenue',
    'commission',
    'status',
    'due_date',
    'actions'
  ];
  
  dataSource: MatTableDataSource<BillingInvoice>;
  loading = true;
  error: string | null = null;
  stats: BillingStats | null = null;

  // Filtros
  selectedStatus: string = 'all';
  statusOptions = ['all', 'pending', 'paid', 'overdue', 'cancelled'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private billingService: BillingService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<BillingInvoice>([]);
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus;
    }

    this.billingService.getAllInvoices(filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.invoices;
        this.stats = response.stats;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoices:', err);
        this.error = 'Error al cargar las facturas';
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onStatusFilterChange(): void {
    this.loadInvoices();
  }

  markAsPaid(invoice: BillingInvoice): void {
    const payment_method = prompt('Método de pago (ej: bank_transfer, cash, check):');
    if (!payment_method) return;

    const payment_reference = prompt('Referencia de pago (opcional):');
    const notes = prompt('Notas adicionales (opcional):');

    this.billingService.markAsPaid(invoice.id, {
      payment_method,
      payment_reference: payment_reference || undefined,
      notes: notes || undefined
    }).subscribe({
      next: (response) => {
        alert('Factura marcada como pagada');
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error marking as paid:', err);
        alert('Error al marcar como pagada: ' + (err.error?.message || err.message));
      }
    });
  }

  viewTenant(invoice: BillingInvoice): void {
    this.router.navigate(['/super-admin/tenants', invoice.tenant_id]);
  }

  formatDate(dateString: string): string {
    return this.billingService.formatDate(dateString);
  }

  formatCurrency(amount: number): string {
    return this.billingService.formatCurrency(amount);
  }

  getStatusColor(status: string): string {
    return this.billingService.getStatusColor(status);
  }

  getDaysUntilDue(dueDate: string): number {
    return this.billingService.getDaysUntilDue(dueDate);
  }

  isOverdue(invoice: BillingInvoice): boolean {
    return this.billingService.isOverdue(invoice.due_date, invoice.status);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'paid': 'Pagada',
      'overdue': 'Vencida',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  generateMonthlyInvoices(): void {
    if (!confirm('¿Generar facturas mensuales automáticas? Esto procesará todos los tenants elegibles.')) {
      return;
    }

    this.loading = true;
    this.billingService.generateMonthlyInvoices().subscribe({
      next: (response) => {
        alert(`Facturas generadas:\n- Exitosas: ${response.summary.generated}\n- Omitidas: ${response.summary.skipped}\n- Errores: ${response.summary.errors}`);
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error generating invoices:', err);
        alert('Error al generar facturas: ' + (err.error?.message || err.message));
        this.loading = false;
      }
    });
  }
}
