import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BusinessConfigService } from './business-config.service';

/**
 * Servicio para aplicar el tema dinámico basado en la configuración del negocio
 * Actualiza las CSS custom properties (variables) en tiempo real
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private businessConfigService: BusinessConfigService
  ) {
    this.initializeTheme();
  }

  /**
   * Inicializa el tema escuchando cambios en la configuración
   */
  private initializeTheme(): void {
    this.businessConfigService.config$.subscribe(config => {
      if (config) {
        this.applyTheme(config.primary_color, config.secondary_color);
      }
    });
  }

  /**
   * Aplica los colores personalizados al documento
   * Actualiza las CSS custom properties
   */
  applyTheme(primaryColor: string, secondaryColor: string): void {
    const root = this.document.documentElement;
    
    // Aplicar colores principales
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    
    // Generar variaciones de tonos para consistencia
    const primaryLight = this.lightenColor(primaryColor, 20);
    const primaryDark = this.darkenColor(primaryColor, 20);
    
    root.style.setProperty('--primary-light', primaryLight);
    root.style.setProperty('--primary-dark', primaryDark);
    
    // Actualizar colores de Material (opcional, para mayor control)
    // Nota: Material Design requiere reconfiguración de tema para cambios profundos
    // Esta implementación es para cambios básicos de color
  }

  /**
   * Aclara un color hexadecimal en un porcentaje
   */
  private lightenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.min(255, rgb.r + (255 - rgb.r) * (percent / 100));
    const g = Math.min(255, rgb.g + (255 - rgb.g) * (percent / 100));
    const b = Math.min(255, rgb.b + (255 - rgb.b) * (percent / 100));
    
    return this.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
  }

  /**
   * Oscurece un color hexadecimal en un porcentaje
   */
  private darkenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.max(0, rgb.r * (1 - percent / 100));
    const g = Math.max(0, rgb.g * (1 - percent / 100));
    const b = Math.max(0, rgb.b * (1 - percent / 100));
    
    return this.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
  }

  /**
   * Convierte hexadecimal a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convierte RGB a hexadecimal
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Resetea el tema a los valores por defecto
   */
  resetTheme(): void {
    const root = this.document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--primary-light');
    root.style.removeProperty('--primary-dark');
  }
}
