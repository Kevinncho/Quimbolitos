import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  private map?: any;
  private marker?: any;

  modoSeleccion = false;
  coordenadasSeleccionadas: { lat: number; lng: number } | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.inicializarMapa();
    requestAnimationFrame(() => this.map?.invalidateSize());
    setTimeout(() => this.map?.invalidateSize(), 200);
    setTimeout(() => this.map?.invalidateSize(), 500);
    setTimeout(() => this.map?.invalidateSize(), 1000);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.map?.invalidateSize();
  }

  activarModoSeleccion(): void {
    this.modoSeleccion = true;
  }

  private inicializarMapa(): void {
    // El mapa arranca centrado en el mundo y permite zoom/movimiento libre.
    this.map = L.map('travel-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      if (!this.modoSeleccion) {
        return;
      }

      const { lat, lng } = event.latlng;
      this.coordenadasSeleccionadas = { lat, lng };

      this.colocarMarcador(lat, lng);
      this.irACrearMemoria(lat, lng);
    });
  }

  private colocarMarcador(lat: number, lng: number): void {
    if (!this.map) {
      return;
    }

    // Solo mantenemos un marcador activo, correspondiente a la seleccion actual.
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    const iconoMarcador = L.divIcon({
      className: 'memory-marker',
      html: '<span></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    this.marker = L.marker([lat, lng], { icon: iconoMarcador }).addTo(this.map);
  }

  private irACrearMemoria(lat: number, lng: number): void {
    // Las coordenadas viajan por query params para rellenar el formulario.
    this.router.navigate(['/diario/mapa/crear-memoria'], {
      queryParams: {
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      }
    });
  }
}
