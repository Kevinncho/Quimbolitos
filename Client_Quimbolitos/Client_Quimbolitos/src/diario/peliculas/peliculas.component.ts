import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../app/header/header.component';
import { CustomDropdownComponent, CustomDropdownOption } from '../../app/shared/custom-dropdown/custom-dropdown.component';
import { ApiService } from '../../app/service/api.service';
import { AuthService } from '../../app/service/auth.service';
import { GENEROS_PELICULA, GeneroPelicula, PeliculaResponse, PeliculaService } from '../../app/service/pelicula.service';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, CustomDropdownComponent],
  templateUrl: './peliculas.component.html',
  styleUrl: './peliculas.component.css'
})
export class PeliculasComponent implements OnInit {
  private readonly posterFallback = '/assets/Play1.jpeg';
  peliculas: PeliculaResponse[] = [];
  readonly generosDisponibles = GENEROS_PELICULA;
  readonly opcionesGenero: CustomDropdownOption[] = [
    { value: 'todos', label: 'Todos' },
    ...GENEROS_PELICULA
  ];
  filtroBusqueda = '';
  filtroEstado: 'todas' | 'vistas' | 'pendientes' = 'todas';
  filtroGenero: 'todos' | GeneroPelicula = 'todos';
  cargando = false;
  error = '';
  editandoPelicula: PeliculaResponse | null = null;
  editTitulo = '';
  editDescripcion = '';
  editLinkVer = '';
  editVisto = false;
  editGeneros: GeneroPelicula[] = [];
  editImagen: File | null = null;
  editPreview: string | null = null;
  guardandoEdicion = false;
  errorEdicion = '';

  constructor(
    private peliculaService: PeliculaService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
  }

  cargarPeliculas(): void {
    this.cargando = true;
    this.error = '';

    this.peliculaService.getPeliculas().subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudieron cargar las peliculas.';
        this.cargando = false;
      }
    });
  }

  get peliculasFiltradas(): PeliculaResponse[] {
    return this.peliculas.filter((pelicula) => {
      const textoBusqueda = this.filtroBusqueda.trim().toLowerCase();
      const coincideEstado =
        this.filtroEstado === 'todas'
          ? true
          : this.filtroEstado === 'vistas'
            ? pelicula.visto
            : !pelicula.visto;

      const coincideGenero =
        this.filtroGenero === 'todos'
          ? true
          : pelicula.generos.includes(this.filtroGenero);

      const coincideBusqueda =
        !textoBusqueda || pelicula.titulo.toLowerCase().includes(textoBusqueda);

      return coincideEstado && coincideGenero && coincideBusqueda;
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/peliculas', id]);
  }

  volverADiario(): void {
    this.router.navigate(['/diario']);
  }

  getImagenPelicula(pelicula: PeliculaResponse): string {
    if (pelicula.fotoUrl) {
      return this.apiService.getAssetUrl(pelicula.fotoUrl);
    }
    return this.posterFallback;
  }

  onPosterError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.posterFallback)) {
      return;
    }
    image.src = this.posterFallback;
  }

  getEstrellas(promedio: number): string[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.round(promedio) ? 'filled' : 'empty');
  }

  puedeEditar(pelicula: PeliculaResponse): boolean {
    const user = this.authService.getUser();
    return !!user && user.id === pelicula.usuarioId;
  }

  getGeneroLabel(genero: GeneroPelicula): string {
    return this.generosDisponibles.find((item) => item.value === genero)?.label || genero;
  }

  abrirEditar(pelicula: PeliculaResponse, event: Event): void {
    event.stopPropagation();
    this.editandoPelicula = pelicula;
    this.editTitulo = pelicula.titulo;
    this.editDescripcion = pelicula.descripcion || '';
    this.editLinkVer = pelicula.linkVer;
    this.editVisto = pelicula.visto;
    this.editGeneros = [...pelicula.generos];
    this.editImagen = null;
    this.editPreview = pelicula.fotoUrl ? this.apiService.getAssetUrl(pelicula.fotoUrl) : null;
    this.errorEdicion = '';
  }

  cerrarEditar(): void {
    this.editandoPelicula = null;
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
      this.editPreview = this.editandoPelicula?.fotoUrl
        ? this.apiService.getAssetUrl(this.editandoPelicula.fotoUrl)
        : null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  toggleGeneroEdicion(genero: GeneroPelicula): void {
    if (this.editGeneros.includes(genero)) {
      this.editGeneros = this.editGeneros.filter((item) => item !== genero);
      return;
    }

    this.editGeneros = [...this.editGeneros, genero];
  }

  guardarEdicion(): void {
    if (!this.editandoPelicula || this.guardandoEdicion) {
      return;
    }

    if (!this.editTitulo.trim() || !this.editLinkVer.trim()) {
      this.errorEdicion = 'Completa el titulo y el link para ver la pelicula.';
      return;
    }

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    const formData = new FormData();
    formData.append('titulo', this.editTitulo.trim());
    formData.append('descripcion', this.editDescripcion?.trim() || '');
    formData.append('linkVer', this.editLinkVer.trim());
    formData.append('visto', String(this.editVisto));
    this.editGeneros.forEach((genero) => formData.append('generos', genero));
    if (this.editImagen) {
      formData.append('imagen', this.editImagen);
    }

    this.peliculaService.updatePelicula(this.editandoPelicula.id, formData).subscribe({
      next: (peliculaActualizada) => {
        this.peliculas = this.peliculas.map((item) =>
          item.id === peliculaActualizada.id ? peliculaActualizada : item
        );
        this.cerrarEditar();
      },
      error: (error) => {
        this.guardandoEdicion = false;
        this.errorEdicion = error?.error?.message || 'No se pudo actualizar la pelicula.';
      }
    });
  }

  eliminarPelicula(pelicula: PeliculaResponse, event: Event): void {
    event.stopPropagation();
    const confirmar = confirm(`Eliminar la pelicula "${pelicula.titulo}"?`);
    if (!confirmar) {
      return;
    }

    this.peliculaService.deletePelicula(pelicula.id).subscribe({
      next: () => {
        this.peliculas = this.peliculas.filter((item) => item.id !== pelicula.id);
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudo eliminar la pelicula.';
      }
    });
  }
}
