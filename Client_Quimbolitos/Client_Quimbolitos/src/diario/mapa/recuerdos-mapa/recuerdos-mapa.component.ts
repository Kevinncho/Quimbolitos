import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../app/header/header.component';
import { ApiService } from '../../../app/service/api.service';
import { MapaMemoriaService, RecuerdoMapaItem } from '../../../app/service/mapa-memoria.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuerdos-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FormsModule],
  templateUrl: './recuerdos-mapa.component.html',
  styleUrl: './recuerdos-mapa.component.css'
})
export class RecuerdosMapaComponent implements OnInit {
  recuerdos: RecuerdoMapaItem[] = [];
  editandoRecuerdo: RecuerdoMapaItem | null = null;
  editTitulo = '';
  editDescripcion = '';
  editPais = '';
  editCiudad = '';
  editImagen: File | null = null;
  editPreview: string | null = null;
  guardandoEdicion = false;
  errorEdicion = '';
  cargando = false;

  constructor(
    private memoriaService: MapaMemoriaService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.cargarRecuerdosMapa();
  }

  private cargarRecuerdosMapa(): void {
    this.cargando = true;
    this.memoriaService.getRecuerdosMapa().subscribe({
      next: (recuerdos) => {
        this.recuerdos = recuerdos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar recuerdos:', error);
        this.cargando = false;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  abrirEditar(recuerdo: RecuerdoMapaItem, event: Event): void {
    event.stopPropagation();
    this.editandoRecuerdo = recuerdo;
    this.editTitulo = recuerdo.titulo;
    this.editDescripcion = recuerdo.descripcion;
    this.editPais = recuerdo.paisNombre || '';
    this.editCiudad = recuerdo.ciudadNombre || '';
    this.editImagen = null;
    this.editPreview = recuerdo.fotoUrl || null;
    this.errorEdicion = '';
  }

  cerrarEditar(): void {
    this.editandoRecuerdo = null;
    this.editImagen = null;
    this.editPreview = null;
    this.errorEdicion = '';
    this.guardandoEdicion = false;
  }

  onEditarImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.editImagen = file;

    if (!file) {
      this.editPreview = this.editandoRecuerdo?.fotoUrl || null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarEdicion(): void {
    if (!this.editandoRecuerdo || this.guardandoEdicion) {
      return;
    }

    if (!this.editTitulo.trim() || !this.editDescripcion.trim()) {
      this.errorEdicion = 'Completa título y descripción del recuerdo.';
      return;
    }

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    const cambios: Partial<Omit<RecuerdoMapaItem, 'id' | 'usuarioId' | 'usuarioNombre' | 'usuarioFotoPerfil'>> = {
      titulo: this.editTitulo.trim(),
      descripcion: this.editDescripcion.trim(),
      paisNombre: this.editPais.trim() || undefined,
      ciudadNombre: this.editCiudad.trim() || undefined,
      fotoUrl: this.editPreview || undefined
    };

    this.memoriaService.actualizarRecuerdoMapa(this.editandoRecuerdo.id, cambios, this.editImagen).subscribe({
      next: (actualizado) => {
        this.recuerdos = this.recuerdos.map(r => r.id === actualizado.id ? actualizado : r);
        this.guardandoEdicion = false;
        this.cerrarEditar();
      },
      error: (error) => {
        console.error('Error al actualizar recuerdo:', error);
        this.guardandoEdicion = false;
        this.errorEdicion = 'No se pudo actualizar el recuerdo.';
      }
    });
  }

  eliminarRecuerdo(recuerdo: RecuerdoMapaItem, event: Event): void {
    event.stopPropagation();
    const confirmar = confirm(`¿Eliminar el recuerdo "${recuerdo.titulo}"?`);
    if (!confirmar) {
      return;
    }

    this.memoriaService.eliminarRecuerdoMapa(recuerdo.id).subscribe({
      next: () => {
        this.recuerdos = this.recuerdos.filter(r => r.id !== recuerdo.id);
      },
      error: (error) => {
        console.error('Error al eliminar recuerdo:', error);
        alert('No se pudo eliminar el recuerdo.');
      }
    });
  }

  getImagenRecuerdo(recuerdo: RecuerdoMapaItem): string {
    return recuerdo.fotoUrl
      ? this.apiService.getAssetUrl(recuerdo.fotoUrl)
      : '/assets/Recuerdo1.jpeg';
  }
}
