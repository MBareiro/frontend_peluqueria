import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BusinessConfig {
  business_name: string;
  business_type: string;
  employee_label_singular: string;
  employee_label_plural: string;
  service_label_singular: string;
  service_label_plural: string;
  appointment_label: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  currency: string;
  language: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private readonly apiUrl = `${environment.apiUrl}/business-config`;
  private configSubject = new BehaviorSubject<BusinessConfig | null>(null);
  
  // Configuración por defecto
  private readonly defaultConfig: BusinessConfig = {
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
    language: 'es',
    active: true
  };

  constructor(private http: HttpClient) {}

  /**
   * Carga la configuración del negocio desde el backend
   */
  loadConfig(): Observable<BusinessConfig> {
    return this.http.get<BusinessConfig>(this.apiUrl).pipe(
      tap(config => {
        this.configSubject.next(config);
        this.applyBranding(config);
      })
    );
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): BusinessConfig {
    return this.configSubject.value || this.defaultConfig;
  }

  /**
   * Observable para suscribirse a cambios en la configuración
   */
  getConfig$(): Observable<BusinessConfig | null> {
    return this.configSubject.asObservable();
  }

  /**
   * Aplica los colores del branding al documento
   */
  private applyBranding(config: BusinessConfig): void {
    const root = document.documentElement;
    
    // Aplicar colores primarios
    root.style.setProperty('--primary-color', config.primary_color);
    root.style.setProperty('--secondary-color', config.secondary_color);
    
    // Cambiar el título de la página
    document.title = config.business_name;
    
    console.log('🎨 Branding aplicado:', config.business_name);
  }

  /**
   * Obtiene el nombre del negocio
   */
  getBusinessName(): string {
    return this.getConfig().business_name;
  }

  /**
   * Obtiene las etiquetas personalizadas de empleados
   */
  getEmployeeLabels(): { singular: string; plural: string } {
    const config = this.getConfig();
    return {
      singular: config.employee_label_singular,
      plural: config.employee_label_plural
    };
  }

  /**
   * Obtiene las etiquetas personalizadas de servicios
   */
  getServiceLabels(): { singular: string; plural: string } {
    const config = this.getConfig();
    return {
      singular: config.service_label_singular,
      plural: config.service_label_plural
    };
  }

  /**
   * Obtiene la etiqueta de citas/turnos
   */
  getAppointmentLabel(): string {
    return this.getConfig().appointment_label;
  }
}
