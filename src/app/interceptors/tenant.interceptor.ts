import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantService } from '../core/services/tenant.service';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  
  constructor(private tenantService: TenantService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get tenant subdomain from TenantService
    const subdomain = this.tenantService.getTenant();
    
    // Skip for certain routes that don't need tenant
    const skipRoutes = ['/api/super-admin', '/swagger', '/api-docs'];
    const shouldSkip = skipRoutes.some(route => req.url.includes(route));
    
    if (!shouldSkip && subdomain && subdomain !== 'default') {
      // Add X-Tenant-Subdomain header for tenant identification
      const modifiedReq = req.clone({
        setHeaders: {
          'X-Tenant-Subdomain': subdomain
        }
      });
      return next.handle(modifiedReq);
    }
    
    return next.handle(req);
  }
}

