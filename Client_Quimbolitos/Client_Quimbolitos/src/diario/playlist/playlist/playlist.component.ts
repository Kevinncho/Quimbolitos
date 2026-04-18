import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../app/service/api.service';
import { AuthService } from '../../../app/service/auth.service';
import { CancionResponse, CancionService } from '../../../app/service/cancion.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css'
})
export class PlaylistComponent implements OnInit {
  canciones: CancionResponse[] = [];
  cargando = false;
  error = '';
  ordenSeleccionado: 'fecha' | 'usuario' = 'fecha';
  ordenAbierto = false;

  indexActual = 0;

  audioPlayer: HTMLAudioElement | null = null;
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

  constructor(
    private cancionService: CancionService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCanciones();
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

    this.cancionService.deleteCancion(cancion.id).subscribe({
      next: () => {
        this.canciones = this.canciones.filter((item) => item.id !== cancion.id);
        this.indexActual = 0;
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
        this.indexActual = 0;
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
    this.ensureAudioPlayer();
    const src = this.getAudioSrc(cancion);

    if (this.audioPlayer && this.audioPlayer.src !== src) {
      this.audioPlayer.src = src;
      this.audioPlayer.load();
    }

    if (this.isPlaying) {
      this.audioPlayer?.pause();
      this.isPlaying = false;
      return;
    }

    this.audioPlayer?.play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(() => {
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
      this.resetAudio();
      return;
    }

    this.ensureAudioPlayer();
    const src = this.getAudioSrc(cancion);
    if (this.audioPlayer && this.audioPlayer.src !== src) {
      this.audioPlayer.src = src;
      this.audioPlayer.load();
    }

    if (this.isPlaying) {
      this.audioPlayer?.play().catch(() => {
        this.isPlaying = false;
      });
    }
  }

  private ensureAudioPlayer(): void {
    if (this.audioPlayer) {
      return;
    }
    this.audioPlayer = new Audio();
    this.audioPlayer.addEventListener('timeupdate', () => {
      this.tiempoActual = this.audioPlayer?.currentTime ?? 0;
    });
    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.duracion = this.audioPlayer?.duration ?? 0;
    });
    this.audioPlayer.addEventListener('ended', () => {
      this.isPlaying = false;
      this.tiempoActual = 0;
    });
  }

  private resetAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
      this.audioPlayer.load();
    }
    this.isPlaying = false;
    this.tiempoActual = 0;
    this.duracion = 0;
  }
}
