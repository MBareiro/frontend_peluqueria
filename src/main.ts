
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { TenantService } from './app/services/tenant.service';

// Detectar tenant antes del bootstrap y exponerlo globalmente
const tenantService = new TenantService();
tenantService.detectTenant();
// Exponer tenantId globalmente (window.tenantId)
(window as any).tenantId = tenantService.getTenantId();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
