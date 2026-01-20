import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TenantInvoice {
  id: number;
  invoice_number: string;
  period: string;
  period_start: string;
  period_end: string;
  total_appointments: number;
  total_revenue: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface TenantBillingStats {
  total_invoices: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  total_commissions: number;
  paid_commissions: number;
  pending_commissions: number;
}

export interface BillingSummary {
  tenant: {
    business_name: string;
    subdomain: string;
    owner_email: string;
    commission_rate: number;
    trial_ends_at: string;
    payment_status: string;
    total_revenue: number;
    next_billing_date: string;
  };
  lastInvoice: TenantInvoice | null;
  pendingInvoice: TenantInvoice | null;
  currentMonth: {
    appointments: number;
    revenue: number;
    estimatedCommission: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TenantBillingService {
  private apiUrl = `${environment.apiUrl}/tenant`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las facturas del tenant
   */
  getMyInvoices(): Observable<{ success: boolean; invoices: TenantInvoice[]; stats: TenantBillingStats }> {
    return this.http.get<{ success: boolean; invoices: TenantInvoice[]; stats: TenantBillingStats }>(
      `${this.apiUrl}/my-invoices`
    );
  }

  /**
   * Obtener detalle de una factura específica
   */
  getInvoiceDetail(invoiceId: number): Observable<{ success: boolean; invoice: TenantInvoice; appointments: any[] }> {
    return this.http.get<{ success: boolean; invoice: TenantInvoice; appointments: any[] }>(
      `${this.apiUrl}/my-invoices/${invoiceId}`
    );
  }

  /**
   * Obtener resumen de facturación
   */
  getBillingSummary(): Observable<{ success: boolean } & BillingSummary> {
    return this.http.get<{ success: boolean } & BillingSummary>(
      `${this.apiUrl}/billing-summary`
    );
  }
}
