// Importar Leaflet
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { MapSettingsService } from '../../services/map-settings.service';
import { MapSettings } from '../../models/map-settings.model';

@Component({
  selector: 'app-map',
  template: `<div id="map" style="height: 250px; width: 100%;"></div>`,
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  private settings: MapSettings | null = null;

  constructor(private mapSettingsService: MapSettingsService) {}

  ngAfterViewInit(): void {
    this.loadMapSettings();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadMapSettings(): void {
    this.mapSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.initMap();
      },
      error: (error) => {
        console.error('Error al cargar configuración del mapa:', error);
        // Usar valores por defecto si falla
        this.settings = {
          id: 0,
          latitude: -25.2637,
          longitude: -57.5759,
          zoom: 15
        };
        this.initMap();
      }
    });
  }

  private async initMap(): Promise<void> {
    if (!this.settings) return;

    // Load leaflet dynamically to avoid bundling it into main bundle
    const L = await import('leaflet');
    
    // Inicializar el mapa con coordenadas desde backend
    this.map = (L as any).map('map').setView(
      [this.settings.latitude, this.settings.longitude], 
      this.settings.zoom
    );

    // Añadir capa base de OpenStreetMap
    (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map as any);

    // Crear popup con información del negocio
    let popupContent = '';
    if (this.settings.businessName) {
      popupContent += `<strong>${this.settings.businessName}</strong><br>`;
    }
    if (this.settings.address) {
      popupContent += this.settings.address;
    }

    // Añadir marcador
    const marker = (L as any).marker([this.settings.latitude, this.settings.longitude])
      .addTo(this.map as any);
    
    if (popupContent) {
      marker.bindPopup(popupContent).openPopup();
    }
  }
}
