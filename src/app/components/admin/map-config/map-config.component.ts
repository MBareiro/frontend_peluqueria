import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapSettingsService } from '../../../services/map-settings.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MapSettings } from '../../../models/map-settings.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-config',
  templateUrl: './map-config.component.html',
  styleUrls: ['./map-config.component.css']
})
export class MapConfigComponent implements OnInit, OnDestroy {
  private map: any;
  private marker: any;
  
  settings: MapSettings = {
    id: 0,
    latitude: -25.2637,
    longitude: -57.5759,
    zoom: 15,
    // address and businessName are intentionally omitted from admin form
  };
  
  isLoading = false;
  isSaving = false;

  constructor(
    private mapSettingsService: MapSettingsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  loadSettings(): void {
    this.isLoading = true;
    this.mapSettingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.isLoading = false;
        // Intentar obtener ubicación actual del usuario
        this.getCurrentLocation();
      },
      error: (error) => {
        console.error('Error al cargar configuración:', error);
        this.isLoading = false;
        // Intentar obtener ubicación actual del usuario
        this.getCurrentLocation();
      }
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      this.notificationService.showInfo(
        'Solicitando acceso a tu ubicación...',
        'Geolocalización',
        2000
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Si el usuario da permiso, centrar el mapa en su ubicación actual
          this.settings.latitude = position.coords.latitude;
          this.settings.longitude = position.coords.longitude;
          this.settings.zoom = 16; // Zoom más cercano para ubicación actual
          
          this.notificationService.showSuccess(
            'Ubicación detectada. Mueve el marcador a la posición exacta de tu negocio.',
            '¡Listo!',
            3000
          );
          
          setTimeout(() => this.initMap(), 100);
        },
        (error) => {
          // Si el usuario niega permisos o hay error, usar configuración guardada
          console.warn('Geolocalización no disponible:', error.message);
          
          let errorMessage = 'Usando ubicación guardada';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Permiso denegado. Usando ubicación guardada.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Ubicación no disponible. Usando ubicación guardada.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Tiempo agotado. Usando ubicación guardada.';
          }
          
          this.notificationService.showWarning(errorMessage, 'Geolocalización', 3000);
          setTimeout(() => this.initMap(), 100);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Navegador no soporta geolocalización
      this.notificationService.showWarning(
        'Tu navegador no soporta geolocalización. Usando ubicación guardada.',
        'Geolocalización',
        3000
      );
      setTimeout(() => this.initMap(), 100);
    }
  }

  initMap(): void {
    // Eliminar mapa anterior si existe
    if (this.map) {
      this.map.remove();
    }

    // Verificar que el contenedor existe
    const mapContainer = document.getElementById('map-admin');
    if (!mapContainer) {
      console.error('Contenedor del mapa no encontrado');
      return;
    }

    // Crear mapa centrado en las coordenadas guardadas
    this.map = L.map('map-admin').setView(
      [this.settings.latitude, this.settings.longitude],
      this.settings.zoom
    );

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Configurar icono por defecto de Leaflet (sin archivos locales)
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Crear marcador en la posición actual
    this.marker = L.marker([this.settings.latitude, this.settings.longitude], {
      draggable: true,
      icon: defaultIcon
    }).addTo(this.map);

    // Actualizar coordenadas cuando se arrastra el marcador
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.settings.latitude = position.lat;
      this.settings.longitude = position.lng;
    });

    // Actualizar marcador cuando se hace click en el mapa
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.settings.latitude = lat;
      this.settings.longitude = lng;
      this.marker.setLatLng([lat, lng]);
    });

    // Actualizar zoom cuando cambia
    this.map.on('zoomend', () => {
      this.settings.zoom = this.map.getZoom();
    });
  }

  saveSettings(): void {
    this.isSaving = true;
    
    this.mapSettingsService.updateSettings(this.settings).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(
          '¡Configuración guardada!',
          'La ubicación del mapa se actualizó correctamente'
        );
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        this.notificationService.showError(
          'Error al guardar',
          'No se pudo actualizar la configuración del mapa'
        );
        this.isSaving = false;
      }
    });
  }

  centerOnCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.showError(
        'Tu navegador no soporta geolocalización',
        'Error'
      );
      return;
    }

    this.isLoading = true;
    this.notificationService.showInfo(
      'Obteniendo tu ubicación actual...',
      'Geolocalización',
      2000
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.settings.latitude = position.coords.latitude;
        this.settings.longitude = position.coords.longitude;
        this.settings.zoom = 16;
        
        // Actualizar mapa existente
        if (this.map) {
          this.map.setView([this.settings.latitude, this.settings.longitude], this.settings.zoom);
          this.marker.setLatLng([this.settings.latitude, this.settings.longitude]);
        }
        
        this.notificationService.showSuccess(
          'Mapa centrado en tu ubicación actual',
          '¡Listo!'
        );
        this.isLoading = false;
      },
      (error) => {
        let errorMessage = 'No se pudo obtener tu ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permiso denegado. Por favor, habilita la geolocalización en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tiempo agotado al obtener ubicación.';
        }
        
        this.notificationService.showError(errorMessage, 'Error de Geolocalización');
        this.isLoading = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // resetToDefault removed: restore-by-default action was removed from UI per request
}
