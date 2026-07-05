import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../app/service/api.service';
import { AuthService } from '../../../app/service/auth.service';
import { GENEROS_PELICULA, GeneroPelicula, PeliculaResponse, PeliculaService, ResenaPeliculaResponse } from '../../../app/service/pelicula.service';

@Component({
  selector: 'app-detalle-pelicula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-pelicula.component.html',
  styleUrl: './detalle-pelicula.component.css'
})
export class DetallePeliculaComponent implements OnInit {
  readonly generosDisponibles = GENEROS_PELICULA;
  private readonly posterFallback = '/assets/Play1.jpeg';
  private readonly avatarFallback = '/assets/sinuser.svg';
  pelicula: PeliculaResponse | null = null;
  resenas: ResenaPeliculaResponse[] = [];
  cargando = true;
  error = '';
  rating = 5;
  comentario = '';
  guardandoResena = false;
  errorResena = '';
  usuarioActualId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peliculaService: PeliculaService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.usuarioActualId = this.authService.getUser()?.id || null;

    if (!id) {
      this.router.navigate(['/peliculas']);
      return;
    }

    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.cargando = true;
    this.error = '';

    this.peliculaService.getPeliculaById(id).subscribe({
      next: (pelicula) => {
        this.pelicula = pelicula;
        this.cargarResenas(id);
      },
      error: () => {
        this.router.navigate(['/peliculas']);
      }
    });
  }

  cargarResenas(id: number): void {
    this.peliculaService.getResenas(id).subscribe({
      next: (resenas) => {
        this.resenas = resenas;
        const propia = this.miResena;
        if (propia) {
          this.rating = propia.rating;
          this.comentario = propia.comentario || '';
        }
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudieron cargar las reseñas.';
        this.cargando = false;
      }
    });
  }

  get miResena(): ResenaPeliculaResponse | undefined {
    return this.resenas.find((resena) => resena.usuarioId === this.usuarioActualId);
  }

  get resenasOtras(): ResenaPeliculaResponse[] {
    return this.resenas.filter((resena) => resena.usuarioId !== this.usuarioActualId);
  }

  volver(): void {
    this.router.navigate(['/peliculas']);
  }

  getPortada(): string {
    if (this.pelicula?.fotoUrl) {
      return this.apiService.getAssetUrl(this.pelicula.fotoUrl);
    }
    return this.posterFallback;
  }

  getAvatar(path?: string): string {
    if (path) {
      return this.apiService.getAssetUrl(path);
    }
    return this.avatarFallback;
  }

  onPosterError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.posterFallback)) {
      return;
    }
    image.src = this.posterFallback;
  }

  onAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.avatarFallback)) {
      return;
    }
    image.src = this.avatarFallback;
  }

  setRating(value: number): void {
    this.rating = value;
  }

  getStars(value: number): number[] {
    return Array.from({ length: value }, (_, index) => index + 1);
  }

  starArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getGeneroLabel(genero: GeneroPelicula): string {
    return this.generosDisponibles.find((item) => item.value === genero)?.label || genero;
  }

  guardarResena(): void {
    if (!this.pelicula || this.guardandoResena) {
      return;
    }

    this.guardandoResena = true;
    this.errorResena = '';

    this.peliculaService.guardarResena(this.pelicula.id, {
      comentario: this.comentario.trim(),
      rating: this.rating
    }).subscribe({
      next: (resena) => {
        const index = this.resenas.findIndex((item) => item.usuarioId === resena.usuarioId);
        if (index >= 0) {
          this.resenas[index] = resena;
          this.resenas = [...this.resenas];
        } else {
          this.resenas = [...this.resenas, resena];
        }

        const total = this.resenas.length;
        const promedio = this.resenas.reduce((sum, item) => sum + item.rating, 0) / total;
        if (this.pelicula) {
          this.pelicula = {
            ...this.pelicula,
            ratingPromedio: promedio,
            totalResenas: total
          };
        }

        this.guardandoResena = false;
      },
      error: (error) => {
        this.guardandoResena = false;
        this.errorResena = error?.error?.message || 'No se pudo guardar tu reseña.';
      }
    });
  }
}
