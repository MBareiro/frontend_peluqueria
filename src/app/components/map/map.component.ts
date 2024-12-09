// Importar Leaflet
import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  template: `<div id="map" style="height: 500px; width: 100%;"></div>`,
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map: L.Map | undefined;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Inicializar el mapa
    this.map = L.map('map').setView([-26.805222, -55.023778], 15);

    // Añadir capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Añadir marcador
    L.marker([-26.805222, -55.023778])
      .addTo(this.map)/* 
      .bindPopup('¡Aquí está!') */
      .openPopup();
  }
}
