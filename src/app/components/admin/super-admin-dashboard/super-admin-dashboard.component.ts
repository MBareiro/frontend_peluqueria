import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { GlobalStats } from '../../../models/tenant.model';

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  stats: GlobalStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.tenantService.getGlobalStats().subscribe({
      next: (response) => {
        this.stats = response.stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Error al cargar estadísticas';
        this.loading = false;
      }
    });
  }

  navigateToTenants(): void {
    this.router.navigate(['/super-admin/tenants']);
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
}
