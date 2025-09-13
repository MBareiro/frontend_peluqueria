
import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TenantConfig } from '../models/tenant-config.model';
import { TENANT_ID } from '../app.module';

@Injectable({ providedIn: 'root' })
export class TenantConfigService {
  private http = inject(HttpClient);
  private cfg!: TenantConfig;

  get config() { return this.cfg; }

  constructor(
    @Inject(TENANT_ID) private tenantId: string | null
  ) {}

  async load(): Promise<void> {
    let url = '/api/tenant-config';
    if (this.tenantId) {
      url += `?tenant=${this.tenantId}`;
    }
    const res = await this.http.get<TenantConfig>(url).toPromise();
    this.cfg = res!;
    (window as any).__TENANT__ = this.cfg; // útil para otros sitios (interceptor)
  }
}
