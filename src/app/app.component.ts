import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BusinessConfigService } from './services/business-config.service';
import { ThemeService } from './services/theme.service';
import { TenantService } from './core/services/tenant.service';
import { BrandingService } from './core/services/branding.service';
import { TenantDetectionService } from './core/services/tenant-detection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sistema de Turnos';
  isLandingPage = false;

  constructor(
    private router: Router,
    private businessConfigService: BusinessConfigService,
    private themeService: ThemeService,
    private tenantService: TenantService,
    private brandingService: BrandingService,
    private tenantDetectionService: TenantDetectionService
  ) {
    // Detectar si es landing page
    this.isLandingPage = this.tenantDetectionService.isLandingPage();
    
    if (this.isLandingPage) {
      // No redirigir si ya estamos en una ruta específica (como /super-admin/login)
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '') {
        console.log('🎯 Landing page detectada - redirigiendo a /landing');
        this.router.navigate(['/landing']);
      }
    } else {
      console.log('🏢 Tenant detectado:', this.tenantDetectionService.getTenantSubdomain());
    }
  }

  ngOnInit() {
    // Solo cargar configuración si NO es landing page
    if (!this.isLandingPage) {
      this.loadTenantConfig();
    }

    // Detectar cambios de ruta para actualizar contexto
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLandingPage = this.tenantDetectionService.isLandingPage();
      });
  }

  private loadTenantConfig() {
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
