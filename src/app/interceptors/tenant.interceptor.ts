import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Intenta obtener el id del tenant desde la config cargada o desde window.tenantId
  const t: any = (window as any).__TENANT__;
  const tenantId = t?.id || (window as any).tenantId;
  // Adjunta el header X-Tenant-Id si está disponible
  const clone = tenantId ? req.clone({ setHeaders: { 'X-Tenant-Id': tenantId } }) : req;
  return next.handle(clone);
  }
}
