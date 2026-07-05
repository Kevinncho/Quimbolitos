import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GENEROS_PELICULA, GeneroPelicula, PeliculaService } from '../../../app/service/pelicula.service';

@Component({
  selector: 'app-crear-pelicula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent {
  titulo = '';
  descripcion = '';
  linkVer = '';
  visto = false;
  generosSeleccionados: GeneroPelicula[] = [];
  readonly generosDisponibles = GENEROS_PELICULA;
  imagen: File | null = null;
  preview: string | null = null;
  guardando = false;
  error = '';

  constructor(
    private router: Router,
    private peliculaService: PeliculaService
  ) {}

  volver(): void {
    this.router.navigate(['/peliculas']);
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

  toggleGenero(genero: GeneroPelicula): void {
    if (this.generosSeleccionados.includes(genero)) {
      this.generosSeleccionados = this.generosSeleccionados.filter((item) => item !== genero);
      return;
    }

    this.generosSeleccionados = [...this.generosSeleccionados, genero];
  }

  guardarPelicula(): void {
    if (this.guardando) {
      return;
    }

    if (!this.titulo.trim() || !this.linkVer.trim()) {
      this.error = 'Completa el titulo y el link para ver la pelicula.';
      return;
    }

    this.guardando = true;
    this.error = '';

    const formData = new FormData();
    formData.append('titulo', this.titulo.trim());
    formData.append('descripcion', this.descripcion?.trim() || '');
    formData.append('linkVer', this.linkVer.trim());
    formData.append('visto', String(this.visto));
    this.generosSeleccionados.forEach((genero) => formData.append('generos', genero));
    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }

    this.peliculaService.createPelicula(formData).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/peliculas']);
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No se pudo guardar la pelicula.';
      }
    });
  }
}
