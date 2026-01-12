import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Tenant {
  id: number;
  subdomain: string;
  business_name: string;
  business_type?: string;
  active: boolean;
}

@Component({
  selector: 'app-tenant-selector-page',
  templateUrl: './tenant-selector-page.component.html',
  styleUrls: ['./tenant-selector-page.component.css']
})
export class TenantSelectorPageComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  isProduction = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // En producción, esta página no debería ser visible
    this.isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (!this.isProduction) {
      this.loadTenants();
    }
  }

  private loadTenants(): void {
    this.http.get<Tenant[]>(`${environment.apiUrl}/super-admin/tenants`)
      .subscribe({
        next: (tenants) => {
          this.tenants = tenants.filter(t => t.active);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando tenants:', error);
          // Mostrar tenants de ejemplo si falla la API
          this.tenants = [
            { id: 6, subdomain: 'goku', business_name: 'Barbería Goku', business_type: 'barbershop', active: true }
          ];
          this.loading = false;
        }
      });
  }

  selectTenant(subdomain: string): void {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // En local, simular subdomain guardándolo en localStorage
      localStorage.setItem('tenant_subdomain', subdomain);
      // Recargar la página para que TenantService detecte el cambio
      window.location.reload();
    } else {
      // En producción, redirigir al subdomain real
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = window.location.hostname.split('.').slice(-2).join('.');
      window.location.href = `${protocol}//${subdomain}.${baseDomain}${port}`;
    }
  }

  goToCreateTenant(): void {
    this.router.navigate(['/super-admin']);
  }

  getBusinessTypeIcon(type?: string): string {
    const icons: Record<string, string> = {
      'barbershop': '💈',
      'beauty_salon': '💅',
      'nails': '💅',
      'spa': '💆',
      'massage': '💆‍♂️',
      'tattoo': '🎨',
      'other': '🏢'
    };
    return icons[type || 'other'] || '🏢';
  }
}
