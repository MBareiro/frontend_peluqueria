import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BillingInvoice, BillingStats, MarkPaidRequest } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/super-admin`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las facturas con filtros opcionales
   */
  getAllInvoices(filters?: {
    status?: string;
    tenantId?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<{ success: boolean; invoices: BillingInvoice[]; stats: BillingStats }> {
    let params: any = {};
    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.tenantId) params.tenant_id = filters.tenantId.toString();
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }

    return this.http.get<{ success: boolean; invoices: BillingInvoice[]; stats: BillingStats }>(
      `${this.apiUrl}/invoices`,
      { params, withCredentials: true }
    );
  }

  /**
   * Obtiene las facturas de un tenant específico
   */
  getTenantInvoices(tenantId: number): Observable<{ success: boolean; invoices: BillingInvoice[] }> {
    return this.http.get<{ success: boolean; invoices: BillingInvoice[] }>(
      `${this.apiUrl}/invoices/tenant/${tenantId}`,
      { withCredentials: true }
    );
  }

  /**
   * Marca una factura como pagada
   */
  markAsPaid(invoiceId: number, data: MarkPaidRequest): Observable<{ success: boolean; message: string; invoice: BillingInvoice }> {
    return this.http.put<{ success: boolean; message: string; invoice: BillingInvoice }>(
      `${this.apiUrl}/invoices/${invoiceId}/mark-paid`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Genera facturas mensuales automáticamente (para testing)
   */
  generateMonthlyInvoices(): Observable<{ success: boolean; message: string; results: any[]; summary: any }> {
    return this.http.post<{ success: boolean; message: string; results: any[]; summary: any }>(
      `${this.apiUrl}/generate-monthly`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Genera factura manual para un tenant
   */
  generateInvoice(tenantId: number, startDate: string, endDate: string): Observable<{ success: boolean; invoice: BillingInvoice; summary: any }> {
    return this.http.post<{ success: boolean; invoice: BillingInvoice; summary: any }>(
      `${this.apiUrl}/generate/${tenantId}`,
      { startDate, endDate },
      { withCredentials: true }
    );
  }

  /**
   * Verifica facturas vencidas
   */
  checkOverdueInvoices(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/check-overdue`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /**
   * Formatea monto de dinero
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  /**
   * Obtiene el color según el estado
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#ff9800',   // Naranja
      'paid': '#4caf50',      // Verde
      'overdue': '#f44336',   // Rojo
      'cancelled': '#9e9e9e'  // Gris
    };
    return colors[status] || '#9e9e9e';
  }

  /**
   * Calcula días hasta vencimiento
   */
  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una factura está vencida
   */
  isOverdue(dueDate: string, status: string): boolean {
    return status === 'pending' && this.getDaysUntilDue(dueDate) < 0;
  }
}
