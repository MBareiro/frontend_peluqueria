import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../../core/services/tenant.service';
import { BrandingService } from '../../../core/services/branding.service';
import { BusinessConfig } from '../../../core/services/branding.service';

interface TenantOption {
  subdomain: string;
  name: string;
}

@Component({
  selector: 'app-tenant-selector',
  template: `
    <div class="tenant-selector" *ngIf="showSelector">
      <div class="selector-header" (click)="toggleSelector()">
        <h3>🏢 Tenant: {{ currentTenant }}</h3>
        <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
      </div>
      
      <div class="selector-content" *ngIf="isOpen">
        <p class="current-tenant">
          <strong>Actual:</strong> {{ currentTenant }}
        </p>
        
        <div class="tenant-select">
          <label>Cambiar a:</label>
          <select [(ngModel)]="selectedTenant" (change)="onTenantChange()">
            <option *ngFor="let tenant of tenants" [value]="tenant.subdomain">
              {{ tenant.name }} ({{ tenant.subdomain }})
            </option>
          </select>
        </div>
        
        <div class="branding-info" *ngIf="brandingConfig">
          <p><strong>Negocio:</strong> {{ brandingConfig.business_name }}</p>
          <p>
            <strong>Color:</strong> 
            <span class="color-box" [style.background-color]="brandingConfig.primary_color"></span>
            {{ brandingConfig.primary_color }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenant-selector {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #1976d2;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 9999;
      min-width: 280px;
      max-width: 320px;
    }
    
    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #1976d2;
      color: white;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      user-select: none;
    }
    
    .selector-header:hover {
      background: #1565c0;
    }
    
    .selector-header h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
    }
    
    .toggle-icon {
      font-size: 12px;
    }
    
    .selector-content {
      padding: 16px;
      background: #fafafa;
    }
    
    .current-tenant {
      margin: 0 0 12px 0;
      padding: 8px;
      background: #e3f2fd;
      border-radius: 4px;
      font-size: 12px;
      color: #0d47a1;
    }
    
    .tenant-select {
      margin-bottom: 12px;
    }
    
    .tenant-select label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }
    
    .tenant-select select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 13px;
      background: white;
      cursor: pointer;
    }
    
    .tenant-select select:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    .branding-info {
      padding: 12px;
      background: white;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid #e0e0e0;
    }
    
    .branding-info p {
      margin: 6px 0;
      color: #666;
    }
    
    .color-box {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #ccc;
      border-radius: 2px;
      vertical-align: middle;
      margin: 0 4px;
    }
  `]
})
export class TenantSelectorComponent implements OnInit {
  showSelector = true; // Cambiar a false en producción
  isOpen = false;
  currentTenant = '';
  selectedTenant = '';
  brandingConfig: BusinessConfig | null = null;
  
  tenants: TenantOption[] = [
    { subdomain: 'default', name: 'Default' },
    { subdomain: 'goku', name: 'Goku Peluquería' },
    { subdomain: 'vegeta', name: 'Vegeta Barbershop' }
  ];

  constructor(
    private tenantService: TenantService,
    private brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    // Solo mostrar en desarrollo
    this.showSelector = !window.location.hostname.includes('production');
    
    this.currentTenant = this.tenantService.getTenant();
    this.selectedTenant = this.currentTenant;
    
    // Cargar branding actual
    this.brandingService.getConfig$().subscribe((config: BusinessConfig | null) => {
      this.brandingConfig = config;
    });
  }

  toggleSelector(): void {
    this.isOpen = !this.isOpen;
  }

  onTenantChange(): void {
    if (this.selectedTenant !== this.currentTenant) {
      const confirmed = confirm(
        `¿Cambiar a tenant "${this.selectedTenant}"?\n\nLa página se recargará.`
      );
      
      if (confirmed) {
        this.tenantService.switchTenant(this.selectedTenant);
      } else {
        this.selectedTenant = this.currentTenant;
      }
    }
  }
}
