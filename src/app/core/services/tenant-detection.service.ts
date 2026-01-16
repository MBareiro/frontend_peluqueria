import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenantDetectionService {
  
  /**
   * Determina si el hostname actual corresponde a la landing de marketing
   * o a un tenant específico
   */
  isLandingPage(): boolean {
    const hostname = window.location.hostname;
    
    // En desarrollo
    if (!environment.production) {
      // Si hay query param ?tenant=xxx, NO es landing
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      if (tenantParam) {
        return false; // Tiene tenant específico
      }
      
      // localhost sin subdomain y sin query param = landing
      return hostname === 'localhost' || hostname === '127.0.0.1';
    }
    
    // En producción
    // turnos.com o www.turnos.com = landing
    // cualquier otro subdomain = tenant
    return hostname === environment.mainDomain || 
           hostname === `www.${environment.mainDomain}`;
  }

  /**
   * Obtiene el subdomain del tenant
   * Retorna null si es la landing page
   */
  getTenantSubdomain(): string | null {
    if (this.isLandingPage()) {
      return null;
    }

    const hostname = window.location.hostname;
    
    // En desarrollo: priorizar query param
    if (!environment.production) {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      if (tenantParam) {
        return tenantParam;
      }
      
      // Intentar desde subdomain: default.localhost → "default"
      const parts = hostname.split('.');
      return parts.length > 1 ? parts[0] : null;
    }
    
    // En producción: barberia.turnos.com → "barberia"
    const mainDomain = environment.mainDomain;
    if (hostname.endsWith(`.${mainDomain}`)) {
      return hostname.replace(`.${mainDomain}`, '');
    }
    
    return null;
  }

  /**
   * Verifica si tiene un tenant válido
   */
  hasTenant(): boolean {
    return this.getTenantSubdomain() !== null;
  }

  /**
   * Obtiene información sobre el contexto actual
   */
  getContext(): { isLanding: boolean; subdomain: string | null; hostname: string } {
    return {
      isLanding: this.isLandingPage(),
      subdomain: this.getTenantSubdomain(),
      hostname: window.location.hostname
    };
  }
}
