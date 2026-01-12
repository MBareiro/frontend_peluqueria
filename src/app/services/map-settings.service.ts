import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MapSettings } from '../models/map-settings.model';

@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {
  private baseUrl = `${environment.apiUrl}/map-settings`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener configuración del mapa (público)
   */
  getSettings(): Observable<MapSettings> {
    return this.http.get<MapSettings>(this.baseUrl);
  }

  /**
   * Actualizar configuración del mapa (solo owner)
   */
  updateSettings(settings: Partial<MapSettings>): Observable<any> {
    return this.http.put(this.baseUrl, settings);
  }
}
