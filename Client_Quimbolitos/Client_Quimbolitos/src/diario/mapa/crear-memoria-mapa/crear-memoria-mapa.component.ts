import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GeocodingService } from '../../../app/service/geocoding.service';
import { MapaMemoriaService, RecuerdoMapaItem } from '../../../app/service/mapa-memoria.service';

@Component({
  selector: 'app-crear-memoria-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-memoria-mapa.component.html',
  styleUrl: './crear-memoria-mapa.component.css'
})
export class CrearMemoriaMapaComponent implements OnInit {
  titulo = '';
  descripcion = '';
  pais = '';
  ciudad = '';
  lat: number | null = null;
  lng: number | null = null;
  cargandoUbicacion = false;
  imagen: File | null = null;
  preview: string | null = null;
  guardando = false;
  error = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private geocodingService: GeocodingService,
    private memoriaService: MapaMemoriaService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const lat = Number(params.get('lat'));
      const lng = Number(params.get('lng'));

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        this.lat = lat;
        this.lng = lng;
        this.autocompletarUbicacion(lat, lng);
      }
    });
  }

  volverAlMapa(): void {
    this.router.navigate(['/diario/mapa'], {
      queryParamsHandling: 'preserve'
    });
  }

  guardarMemoria(): void {
    if (this.lat === null || this.lng === null) {
      this.error = 'No se puede guardar la memoria del mapa sin coordenadas.';
      return;
    }

    if (!this.titulo.trim() || !this.descripcion.trim()) {
      this.error = 'Título y descripción son obligatorios.';
      return;
    }

    this.guardando = true;
    this.error = '';

    const memoria: Omit<RecuerdoMapaItem, 'id' | 'fechaRecuerdo' | 'usuarioId' | 'usuarioNombre' | 'usuarioFotoPerfil'> = {
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      latitud: this.lat,
      longitud: this.lng,
      paisNombre: this.pais.trim() || undefined,
      ciudadNombre: this.ciudad.trim() || undefined,
      fotoUrl: this.preview || undefined
    };

    this.memoriaService.guardarRecuerdoMapa(memoria, this.imagen).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/diario/mapa/bitacora']);
      },
      error: (error) => {
        console.error('Error al guardar recuerdo:', error);
        this.guardando = false;
        this.error = 'No se pudo guardar el recuerdo. Inténtalo de nuevo.';
      }
    });
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.imagen = file;

    if (!file) {
      this.preview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private autocompletarUbicacion(lat: number, lng: number): void {
    this.cargandoUbicacion = true;

    this.geocodingService.reverseGeocode(lat, lng).subscribe({
      next: (ubicacion) => {
        this.pais = ubicacion.pais;
        this.ciudad = ubicacion.ciudad;
        this.cargandoUbicacion = false;
      },
      error: () => {
        this.cargandoUbicacion = false;
      }
    });
  }
}
