import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { Tenant, TenantStats } from '../../../models/tenant.model';

@Component({
  selector: 'app-tenant-details',
  templateUrl: './tenant-details.component.html',
  styleUrls: ['./tenant-details.component.css']
})
export class TenantDetailsComponent implements OnInit {
  tenant: Tenant | null = null;
  stats: TenantStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    const tenantId = this.route.snapshot.params['id'];
    this.loadTenantDetails(tenantId);
  }

  loadTenantDetails(tenantId: number): void {
    this.loading = true;
    this.error = null;

    this.tenantService.getTenant(tenantId).subscribe({
      next: (response) => {
        this.tenant = response.tenant;
        this.stats = response.stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenant details:', err);
        this.error = 'Error al cargar los detalles del tenant';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/super-admin/tenants']);
  }

  suspendTenant(): void {
    if (!this.tenant) return;
    
    if (confirm(`¿Estás seguro de suspender el tenant "${this.tenant.business_name}"?`)) {
      this.tenantService.suspendTenant(this.tenant.id).subscribe({
        next: () => {
          alert('Tenant suspendido exitosamente');
          this.loadTenantDetails(this.tenant!.id);
        },
        error: (err) => {
          console.error('Error suspending tenant:', err);
          alert('Error al suspender el tenant');
        }
      });
    }
  }

  activateTenant(): void {
    if (!this.tenant) return;

    this.tenantService.activateTenant(this.tenant.id).subscribe({
      next: () => {
        alert('Tenant activado exitosamente');
        this.loadTenantDetails(this.tenant!.id);
      },
      error: (err) => {
        console.error('Error activating tenant:', err);
        alert('Error al activar el tenant');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: '#2ecc71',
      trial: '#f39c12',
      suspended: '#e74c3c',
      cancelled: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  }

  getPlanColor(plan: string): string {
    const colors: { [key: string]: string } = {
      free: '#95a5a6',
      trial: '#f39c12',
      basic: '#3498db',
      premium: '#9b59b6',
      enterprise: '#e74c3c'
    };
    return colors[plan] || '#95a5a6';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS' 
    }).format(amount);
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      trial: '#ff9800',
      paid: '#4caf50',
      pending: '#2196f3',
      overdue: '#f44336',
      suspended: '#9e9e9e'
    };
    return colors[status] || '#9e9e9e';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      trial: 'Período de Prueba',
      paid: 'Pagado',
      pending: 'Pago Pendiente',
      overdue: 'Pago Vencido',
      suspended: 'Suspendido'
    };
    return labels[status] || status;
  }

  getDaysUntilTrialEnd(): number {
    if (!this.tenant?.trial_ends_at) return -1;
    const trialEnd = new Date(this.tenant.trial_ends_at);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isTrialExpiringSoon(): boolean {
    const days = this.getDaysUntilTrialEnd();
    return days >= 0 && days <= 7;
  }
}
