/**
 * Modelo para Tenant (multi-tenant system)
 */
export interface Tenant {
  id: number;
  subdomain: string;
  business_name: string;
  owner_email: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise' | 'trial';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  max_employees: number;
  max_appointments_per_month: number;
  created_at: string;
  expires_at?: string | null;
  trial_ends_at?: string | null;
  // Billing fields
  commission_rate?: number;
  trial_period_days?: number;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
  last_billing_date?: string | null;
  next_billing_date?: string | null;
  total_revenue?: number;
  payment_status?: 'trial' | 'paid' | 'pending' | 'overdue' | 'suspended';
  settings?: TenantSettings;
  metadata?: any;
}

export interface TenantSettings {
  theme?: string;
  logo_url?: string;
  primary_color?: string;
  features?: string[];
  notifications?: {
    email?: boolean;
    sms?: boolean;
  };
}

export interface TenantStats {
  users: number;
  employees: number;
  appointments: number;
  services: number;
  activeServices: number;
}

export interface TenantWithStats extends Tenant {
  stats: TenantStats;
}

export interface CreateTenantRequest {
  subdomain: string;
  business_name: string;
  owner_email: string;
  owner_password: string;
  owner_name: string;
  plan: string;
}

export interface GlobalStats {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  suspended_tenants: number;
  total_users: number;
  total_appointments: number;
  total_services: number;
  plan_distribution: Array<{ plan: string; count: number }>;
  // Billing stats
  total_revenue?: number;
  pending_invoices?: number;
  overdue_invoices?: number;
  total_commissions?: number;
}

/**
 * Modelo para Factura de Billing
 */
export interface BillingInvoice {
  id: number;
  tenant_id: number;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  total_appointments: number;
  total_revenue: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Relación
  tenant?: {
    subdomain: string;
    business_name: string;
    owner_email: string;
  };
}

export interface BillingStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
  totalCommissions: number;
}

export interface MarkPaidRequest {
  payment_method: string;
  payment_reference?: string;
  notes?: string;
}
