import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly STORAGE_KEY = 'tenant_subdomain';
  private tenantSubject = new BehaviorSubject<string>(this.getStoredTenant());

  constructor() {
    // Detectar subdomain al iniciar
    this.detectSubdomain();
  }

  /**
   * Detecta el subdomain de la URL actual
   * Ejemplos:
   * - goku.localhost:4200 → "goku"
   * - localhost:4200?tenant=mi-barberia → "mi-barberia"
   * - goku.mipeluqueria.com → "goku"
   */
  private detectSubdomain(): void {
    const hostname = window.location.hostname;
    
    // SIEMPRE verificar query params primero (tiene prioridad)
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    
    if (tenantParam) {
      // Query param tiene máxima prioridad
      this.setTenant(tenantParam);
      console.log('🏢 Tenant detectado desde query param:', tenantParam);
      return;
    }
    
    // Si es localhost o IP, usar "goku" por defecto para desarrollo
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      this.setTenant('goku');
      console.log('🏢 Tenant detectado (localhost por defecto): goku');
      return;
    }

    // Extraer subdomain (primera parte antes del primer punto)
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const subdomain = parts[0];
      // No usar "www" como subdomain
      if (subdomain !== 'www') {
        this.setTenant(subdomain);
        console.log('🏢 Tenant detectado desde subdomain:', subdomain);
        return;
      }
    }

    // Si no se detecta subdomain, usar "default"
    this.setTenant('default');
    console.log('🏢 Tenant detectado (por defecto): default');
  }

  /**
   * Establece el tenant actual y lo guarda en localStorage
   */
  setTenant(subdomain: string): void {
    if (subdomain && subdomain !== this.tenantSubject.value) {
      localStorage.setItem(this.STORAGE_KEY, subdomain);
      this.tenantSubject.next(subdomain);
      console.log('🏢 Tenant configurado:', subdomain);
    }
  }

  /**
   * Obtiene el tenant actual desde localStorage
   */
  private getStoredTenant(): string {
    return localStorage.getItem(this.STORAGE_KEY) || 'default';
  }

  /**
   * Obtiene el tenant actual como string
   */
  getTenant(): string {
    return this.tenantSubject.value;
  }

  /**
   * Observable para suscribirse a cambios del tenant
   */
  getTenant$(): Observable<string> {
    return this.tenantSubject.asObservable();
  }

  /**
   * Limpia el tenant almacenado (útil para logout)
   */
  clearTenant(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.detectSubdomain(); // Re-detectar
  }

  /**
   * Para desarrollo: permite cambiar manualmente el tenant
   */
  switchTenant(subdomain: string): void {
    this.setTenant(subdomain);
    // Recargar la página para aplicar el nuevo tenant
    window.location.reload();
  }
}
