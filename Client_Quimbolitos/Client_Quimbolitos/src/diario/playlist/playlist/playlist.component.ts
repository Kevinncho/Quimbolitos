import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../app/service/api.service';
import { AuthService } from '../../../app/service/auth.service';
import { CancionResponse, CancionService } from '../../../app/service/cancion.service';
import { PlaylistAudioService } from '../../../app/service/playlist-audio.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css'
})
export class PlaylistComponent implements OnInit, OnDestroy {
  canciones: CancionResponse[] = [];
  cargando = false;
  error = '';
  ordenSeleccionado: 'fecha' | 'usuario' = 'fecha';
  ordenAbierto = false;

  indexActual = 0;
  isPlaying = false;
  duracion = 0;
  tiempoActual = 0;

  editandoCancion: CancionResponse | null = null;
  editTitulo = '';
  editArtista = '';
  editAlbum = '';
  editDedicatoria = '';
  editImagen: File | null = null;
  editAudio: File | null = null;
  editAudioNombre = '';
  editPreview: string | null = null;
  guardandoEdicion = false;
  errorEdicion = '';

  private audioStateSubscription?: Subscription;

  constructor(
    private cancionService: CancionService,
    private apiService: ApiService,
    private authService: AuthService,
    private playlistAudioService: PlaylistAudioService
  ) {}

  ngOnInit(): void {
    this.audioStateSubscription = this.playlistAudioService.state$.subscribe((state) => {
      this.isPlaying = state.isPlaying;
      this.duracion = state.duration;
      this.tiempoActual = state.currentTime;
      this.syncIndiceConAudio(state.src);
    });

    this.cargarCanciones();
  }

  ngOnDestroy(): void {
    this.audioStateSubscription?.unsubscribe();
  }

  get cancionActual() {
    return this.canciones[this.indexActual] ?? null;
  }

  get ordenLabel(): string {
    return this.ordenSeleccionado === 'fecha' ? 'Más recientes' : 'Primero mi pareja';
  }

  siguiente() {
    if (this.canciones.length === 0) {
      return;
    }
    this.indexActual = (this.indexActual + 1) % this.canciones.length;
    this.cargarAudioActual();
  }

  anterior() {
    if (this.canciones.length === 0) {
      return;
    }
    this.indexActual = (this.indexActual - 1 + this.canciones.length) % this.canciones.length;
    this.cargarAudioActual();
  }

  seleccionarCancion(index: number) {
    this.indexActual = index;
    this.cargarAudioActual();
  }

  getOffset(i: number) {
    let offset = i - this.indexActual;
    const total = this.canciones.length;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  }

  getTransform(i: number) {
    const offset = this.getOffset(i);
    const distance = Math.abs(offset);
    const translateX = offset * 315;
    const scale = offset === 0 ? 1.55 : Math.max(1.4, 1 - distance * 0.1);

    return `translateX(${translateX}px) scale(${scale})`;
  }

  getOpacity(i: number) {
    const distance = Math.abs(this.getOffset(i));

    if (distance === 0) return 1;
    if (distance === 1) return 0.68;
    if (distance === 2) return 0.42;

    return 0.22;
  }

  getZIndex(i: number) {
    return 50 - Math.abs(this.getOffset(i));
  }

  getImagenCancion(cancion: CancionResponse): string {
    if (cancion.url) {
      return this.apiService.getAssetUrl(cancion.url);
    }
    return '/assets/Playlist.jpeg';
  }

  getAudioSrc(cancion: CancionResponse | null): string {
    if (!cancion?.audioUrl) {
      return '';
    }
    return this.apiService.getAssetUrl(cancion.audioUrl);
  }

  toggleOrden(event: Event): void {
    event.stopPropagation();
    this.ordenAbierto = !this.ordenAbierto;
  }

  seleccionarOrden(orden: 'fecha' | 'usuario', event: Event): void {
    event.stopPropagation();
    this.ordenAbierto = false;
    this.cambiarOrden(orden);
  }

  cambiarOrden(orden: 'fecha' | 'usuario'): void {
    this.ordenSeleccionado = orden;
    this.cargarCanciones();
  }

  @HostListener('document:click')
  cerrarOrden(): void {
    this.ordenAbierto = false;
  }

  puedeEditar(cancion: CancionResponse): boolean {
    const user = this.authService.getUser();
    return !!user && user.id === cancion.usuarioId;
  }

  abrirEditar(): void {
    const cancion = this.cancionActual;
    if (!cancion || !this.puedeEditar(cancion)) {
      return;
    }
    this.editandoCancion = cancion;
    this.editTitulo = cancion.titulo;
    this.editArtista = cancion.artista || '';
    this.editAlbum = cancion.album || '';
    this.editDedicatoria = cancion.dedicatoria || '';
    this.editImagen = null;
    this.editAudio = null;
    this.editAudioNombre = '';
    this.editPreview = cancion.url ? this.apiService.getAssetUrl(cancion.url) : null;
    this.errorEdicion = '';
  }

  cerrarEditar(): void {
    this.editandoCancion = null;
    this.editImagen = null;
    this.editAudio = null;
    this.editAudioNombre = '';
    this.editPreview = null;
    this.guardandoEdicion = false;
    this.errorEdicion = '';
  }

  onEditarImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.editImagen = file;

    if (!file) {
      this.editPreview = this.editandoCancion?.url ? this.apiService.getAssetUrl(this.editandoCancion.url) : null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onEditarAudioSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.editAudio = file;
    this.editAudioNombre = file ? file.name : '';
  }

  guardarEdicion(): void {
    if (!this.editandoCancion || this.guardandoEdicion) {
      return;
    }

    if (!this.editTitulo.trim() || !this.editArtista.trim()) {
      this.errorEdicion = 'Completa título y artista.';
      return;
    }

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    const formData = new FormData();
    formData.append('titulo', this.editTitulo.trim());
    formData.append('artista', this.editArtista.trim());
    formData.append('album', this.editAlbum?.trim() || '');
    formData.append('dedicatoria', this.editDedicatoria?.trim() || '');
    if (this.editImagen) {
      formData.append('imagen', this.editImagen);
    }
    if (this.editAudio) {
      formData.append('audio', this.editAudio);
    }

    this.cancionService.updateCancion(this.editandoCancion.id, formData).subscribe({
      next: (cancionActualizada) => {
        this.canciones = this.canciones.map((item) =>
          item.id === cancionActualizada.id ? cancionActualizada : item
        );
        this.syncIndiceConAudio(this.playlistAudioService.snapshot.src);
        this.guardandoEdicion = false;
        this.cerrarEditar();
      },
      error: (error) => {
        this.guardandoEdicion = false;
        this.errorEdicion = error?.error?.message || 'No se pudo actualizar la canción.';
      }
    });
  }

  eliminarCancion(): void {
    const cancion = this.cancionActual;
    if (!cancion || !this.puedeEditar(cancion)) {
      return;
    }

    const confirmar = confirm(`¿Eliminar la canción "${cancion.titulo}"?`);
    if (!confirmar) {
      return;
    }

    const audioActual = this.getAudioSrc(cancion);

    this.cancionService.deleteCancion(cancion.id).subscribe({
      next: () => {
        this.canciones = this.canciones.filter((item) => item.id !== cancion.id);
        if (this.playlistAudioService.snapshot.src === audioActual) {
          this.playlistAudioService.stop();
        }
        this.indexActual = Math.min(this.indexActual, Math.max(this.canciones.length - 1, 0));
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudo eliminar la canción.';
      }
    });
  }

  private cargarCanciones(): void {
    this.cargando = true;
    this.error = '';

    this.cancionService.getCancionesOrden(this.ordenSeleccionado).subscribe({
      next: (canciones) => {
        this.canciones = canciones;
        this.syncIndiceConAudio(this.playlistAudioService.snapshot.src);
        this.cargarAudioActual();
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.error = error?.error?.message || 'No se pudieron cargar las canciones.';
      }
    });
  }

  togglePlay(): void {
    const cancion = this.cancionActual;
    if (!cancion || !cancion.audioUrl) {
      this.error = 'Esta canción no tiene audio.';
      return;
    }

    this.error = '';
    const src = this.getAudioSrc(cancion);
    this.playlistAudioService.setSource(src);

    if (this.isPlaying && this.playlistAudioService.snapshot.src === src) {
      this.playlistAudioService.pause();
      return;
    }

    this.playlistAudioService.play().catch(() => {
      this.error = 'No se pudo reproducir el audio.';
    });
  }

  get progreso(): number {
    if (!this.duracion) {
      return 0;
    }
    return Math.min(100, (this.tiempoActual / this.duracion) * 100);
  }

  private cargarAudioActual(): void {
    const cancion = this.cancionActual;
    if (!cancion?.audioUrl) {
      return;
    }

    const src = this.getAudioSrc(cancion);
    const estabaReproduciendo = this.playlistAudioService.snapshot.isPlaying;
    this.playlistAudioService.setSource(src);

    if (estabaReproduciendo) {
      this.playlistAudioService.play().catch(() => {
        this.isPlaying = false;
      });
    }
  }

  private syncIndiceConAudio(src: string): void {
    if (this.canciones.length === 0) {
      this.indexActual = 0;
      return;
    }

    if (!src) {
      this.indexActual = Math.min(this.indexActual, this.canciones.length - 1);
      return;
    }

    const indice = this.canciones.findIndex((cancion) => this.getAudioSrc(cancion) === src);
    if (indice >= 0) {
      this.indexActual = indice;
    } else if (this.indexActual >= this.canciones.length) {
      this.indexActual = 0;
    }
  }
}
