import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tenant, CreateTenantRequest, TenantStats, GlobalStats } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = environment.apiUrl;
  private currentTenantSubject = new BehaviorSubject<string>('default');
  public currentTenant$ = this.currentTenantSubject.asObservable();

  constructor(private http: HttpClient) {
    this.detectTenant();
  }

  /**
   * Detecta el tenant actual basado en el subdomain
   */
  private detectTenant(): void {
    const hostname = window.location.hostname;
    
    // Desarrollo local: usar 'default'
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      const subdomain = this.getTenantFromLocalStorage() || 'default';
      this.currentTenantSubject.next(subdomain);
      return;
    }

    // Producción: extraer subdomain de la URL
    // Ej: barberia.mipeluqueria.com → barberia
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      this.currentTenantSubject.next(subdomain);
    } else {
      this.currentTenantSubject.next('default');
    }
  }

  /**
   * Obtiene el tenant actual
   */
  getCurrentTenant(): string {
    return this.currentTenantSubject.value;
  }

  /**
   * Cambia el tenant actual (solo para desarrollo)
   */
  setCurrentTenant(subdomain: string): void {
    this.currentTenantSubject.next(subdomain);
    localStorage.setItem('current_tenant', subdomain);
  }

  /**
   * Obtiene el tenant desde localStorage
   */
  private getTenantFromLocalStorage(): string | null {
    return localStorage.getItem('current_tenant');
  }

  /**
   * Agrega el header X-Tenant-Subdomain a las peticiones
   */
  getTenantHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Tenant-Subdomain': this.getCurrentTenant()
    });
  }

  // ========== ENDPOINTS DE SUPER ADMIN ==========

  /**
   * Lista todos los tenants (solo super admin)
   */
  listAllTenants(): Observable<{ success: boolean; tenants: Tenant[] }> {
    return this.http.get<{ success: boolean; tenants: Tenant[] }>(
      `${this.apiUrl}/super-admin/tenants`,
      { withCredentials: true }
    );
  }

  /**
   * Obtiene detalles de un tenant específico
   */
  getTenant(tenantId: number): Observable<{ success: boolean; tenant: Tenant; stats: TenantStats }> {
    return this.http.get<{ success: boolean; tenant: Tenant; stats: TenantStats }>(
      `${this.apiUrl}/super-admin/tenants/${tenantId}`,
      { withCredentials: true }
    );
  }

  /**
   * Crea un nuevo tenant
   */
  createTenant(data: CreateTenantRequest): Observable<{ success: boolean; tenant: Tenant; owner: any }> {
    return this.http.post<{ success: boolean; tenant: Tenant; owner: any }>(
      `${this.apiUrl}/super-admin/tenants`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Actualiza un tenant
   */
  updateTenant(tenantId: number, data: Partial<Tenant>): Observable<{ success: boolean; tenant: Tenant }> {
    return this.http.put<{ success: boolean; tenant: Tenant }>(
      `${this.apiUrl}/super-admin/tenants/${tenantId}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Suspende un tenant
   */
  suspendTenant(tenantId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/super-admin/tenants/${tenantId}/suspend`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Activa un tenant
   */
  activateTenant(tenantId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/super-admin/tenants/${tenantId}/activate`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Obtiene estadísticas globales de la plataforma
   */
  getGlobalStats(): Observable<{ success: boolean; stats: GlobalStats }> {
    return this.http.get<{ success: boolean; stats: GlobalStats }>(
      `${this.apiUrl}/super-admin/stats`,
      { withCredentials: true }
    );
  }
}

