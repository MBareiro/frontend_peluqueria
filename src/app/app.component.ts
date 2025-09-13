import { Component } from '@angular/core';
import { TenantConfigService } from './services/tenant-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  get logoUrl(): string | undefined {
    return this.tenantConfig.config?.logo_url;
  }
  get tenantName(): string | undefined {
    return this.tenantConfig.config?.name;
  }
  constructor(public tenantConfig: TenantConfigService) {}
}
