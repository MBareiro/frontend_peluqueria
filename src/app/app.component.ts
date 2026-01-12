
import { Component, OnInit } from '@angular/core';
import { BusinessConfigService } from './services/business-config.service';
import { ThemeService } from './services/theme.service';
import { TenantService } from './core/services/tenant.service';
import { BrandingService } from './core/services/branding.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sistema de Turnos';

  constructor(
    private businessConfigService: BusinessConfigService,
    private themeService: ThemeService,
    private tenantService: TenantService, // Detecta subdomain automáticamente
    private brandingService: BrandingService // Aplica branding dinámico
  ) {
    // El TenantService se inicializa automáticamente y detecta el subdomain
    console.log('🏢 Tenant actual:', this.tenantService.getTenant());
  }

  ngOnInit() {
    // Cargar configuración de branding según el tenant
    this.brandingService.loadConfig().subscribe({
      next: (config) => {
        this.title = config.business_name;
        console.log('✅ Branding cargado:', config.business_name);
      },
      error: (err) => {
        console.warn('⚠️ No se pudo cargar branding, usando valores por defecto', err);
      }
    });

    // También cargar la configuración antigua (compatibilidad)
    this.businessConfigService.loadConfig().then(config => {
      this.title = config.business_name || this.title;
    }).catch(err => {
      console.warn('⚠️ businessConfigService error:', err);
    });
  }
}
