import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CancionService } from '../../../app/service/cancion.service';

@Component({
  selector: 'app-crear-cancion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cancion.component.html',
  styleUrl: './crear-cancion.component.css'
})
export class CrearCancionComponent {
  titulo = '';
  artista = '';
  album = '';
  dedicatoria = '';
  imagen: File | null = null;
  audio: File | null = null;
  audioNombre = '';
  preview: string | null = null;
  guardando = false;
  error = '';

  constructor(
    private router: Router,
    private cancionService: CancionService
  ) {}

  cerrarFormulario() {
    this.router.navigate(['/playlist']);
  }

  onImagenSeleccionada(event: Event) {
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

  onAudioSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.audio = file;
    this.audioNombre = file ? file.name : '';
  }

  guardarCancion() {
    if (this.guardando) {
      return;
    }

    if (!this.titulo.trim() || !this.artista.trim()) {
      this.error = 'Completa titulo y artista.';
      return;
    }

    if (!this.audio) {
      this.error = 'Selecciona un audio para la canción.';
      return;
    }

    this.guardando = true;
    this.error = '';

    const formData = new FormData();
    formData.append('titulo', this.titulo.trim());
    formData.append('artista', this.artista.trim());
    formData.append('album', this.album?.trim() || '');
    formData.append('dedicatoria', this.dedicatoria?.trim() || '');
    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }
    if (this.audio) {
      formData.append('audio', this.audio);
    }

    this.cancionService.createCancion(formData).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/playlist']);
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No se pudo guardar la canción.';
      }
    });
  }
}
