// Uso sugerido:
// Inyectar TENANT_ID en cualquier servicio/componente:
// constructor(@Inject(TENANT_ID) private tenantId: string | null) {}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private tenantId: string | null = null;

  /**
   * Detecta el tenant por subdominio o ruta.
   * Llama esto en el arranque de la app.
   */
  detectTenant(): void {
    // Por subdominio
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
      this.tenantId = parts[0];
      return;
    }
    // Por ruta
    const path = window.location.pathname.split('/');
    if (path.length > 1 && path[1]) {
      this.tenantId = path[1];
      return;
    }
    this.tenantId = null;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }
}
