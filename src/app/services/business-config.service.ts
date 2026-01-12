import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BusinessConfig, BusinessTypePreset } from '../models/business-config.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessConfigService {
  private baseUrl = `${environment.apiUrl}/business-config`;
  
  // Observable para que los componentes se suscriban
  private configSubject = new BehaviorSubject<BusinessConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    // NO cargar automáticamente - dejar que los componentes decidan cuándo cargar
    // this.loadConfig();
  }

  /**
   * Carga la configuración del negocio desde el backend
   */
  async loadConfig(): Promise<BusinessConfig> {
    try {
      const config = await firstValueFrom(
        this.http.get<BusinessConfig>(this.baseUrl)
      );
      this.configSubject.next(config);
      return config;
    } catch (error) {
      console.error('Error loading business config:', error);
      // Retornar valores por defecto en caso de error
      const defaultConfig: BusinessConfig = {
        business_name: 'Mi Negocio',
        business_type: 'other',
        employee_label_singular: 'Profesional',
        employee_label_plural: 'Profesionales',
        service_label_singular: 'Servicio',
        service_label_plural: 'Servicios',
        appointment_label: 'Turno',
        primary_color: '#1976d2',
        secondary_color: '#0d47a1',
        timezone: 'America/Asuncion',
        currency: 'PYG',
        language: 'es'
      };
      this.configSubject.next(defaultConfig);
      return defaultConfig;
    }
  }

  /**
   * Obtiene la configuración actual (síncrono)
   */
  getCurrentConfig(): BusinessConfig | null {
    return this.configSubject.value;
  }

  /**
   * Actualiza la configuración del negocio (solo owner)
   */
  updateConfig(config: Partial<BusinessConfig>): Observable<any> {
    return this.http.put(this.baseUrl, config).pipe(
      tap(() => this.loadConfig()) // Recargar después de actualizar
    );
  }

  /**
   * Obtiene presets de tipos de negocio
   */
  getBusinessTypePresets(): Observable<Record<string, BusinessTypePreset>> {
    return this.http.get<Record<string, BusinessTypePreset>>(`${this.baseUrl}/presets`);
  }

  /**
   * Inicializa la configuración (primera vez)
   */
  initializeConfig(config: Partial<BusinessConfig>): Observable<any> {
    return this.http.post(`${this.baseUrl}/initialize`, config).pipe(
      tap(() => this.loadConfig())
    );
  }

  /**
   * Helper: Obtiene el icono según el tipo de negocio
   */
  getBusinessIcon(type?: string): string {
    const icons: Record<string, string> = {
      barbershop: '💈',
      beauty_salon: '✨',
      nails: '💅',
      spa: '🧖',
      massage: '💆',
      tattoo: '🎨',
      other: '📅'
    };
    return icons[type || 'other'] || icons['other'];
  }
}
