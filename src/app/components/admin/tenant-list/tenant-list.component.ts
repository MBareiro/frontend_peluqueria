import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TenantService } from '../../../services/tenant.service';
import { Tenant } from '../../../models/tenant.model';
import { TenantFormDialogComponent } from '../tenant-form-dialog/tenant-form-dialog.component';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.css']
})
export class TenantListComponent implements OnInit {
  displayedColumns: string[] = ['subdomain', 'business_name', 'owner_email', 'status', 'created_at', 'actions'];
  dataSource: MatTableDataSource<Tenant>;
  loading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tenantService: TenantService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Tenant>([]);
  }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.error = null;

    this.tenantService.listAllTenants().subscribe({
      next: (response) => {
        this.dataSource.data = response.tenants;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.error = 'Error al cargar los tenants';
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTenants();
      }
    });
  }

  openEditDialog(tenant: Tenant): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', tenant }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTenants();
      }
    });
  }

  viewDetails(tenant: Tenant): void {
    this.router.navigate(['/super-admin/tenants', tenant.id]);
  }

  viewInvoices(tenant: Tenant): void {
    this.router.navigate(['/super-admin/billing'], { 
      queryParams: { tenantId: tenant.id } 
    });
  }

  suspendTenant(tenant: Tenant): void {
    if (confirm(`¿Estás seguro de suspender el tenant "${tenant.business_name}"?`)) {
      this.tenantService.suspendTenant(tenant.id).subscribe({
        next: () => {
          alert('Tenant suspendido exitosamente');
          this.loadTenants();
        },
        error: (err) => {
          console.error('Error suspending tenant:', err);
          alert('Error al suspender el tenant');
        }
      });
    }
  }

  activateTenant(tenant: Tenant): void {
    this.tenantService.activateTenant(tenant.id).subscribe({
      next: () => {
        alert('Tenant activado exitosamente');
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error activating tenant:', err);
        alert('Error al activar el tenant');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'green',
      trial: 'orange',
      suspended: 'red',
      cancelled: 'grey'
    };
    return colors[status] || 'grey';
  }

  getPlanColor(plan: string): string {
    const colors: { [key: string]: string } = {
      free: 'grey',
      trial: 'orange',
      basic: 'blue',
      premium: 'purple',
      enterprise: 'red'
    };
    return colors[plan] || 'grey';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
