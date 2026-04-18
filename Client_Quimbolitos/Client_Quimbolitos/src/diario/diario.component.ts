import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../app/header/header.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../app/service/api.service';
import { RecuerdoResponse, RecuerdoService } from '../app/service/recuerdo.service';
import { AuthService } from '../app/service/auth.service';

@Component({
  selector: 'app-diario',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './diario.component.html',
  styleUrl: './diario.component.css'
})
export class DiarioComponent implements OnInit {
  recuerdos: RecuerdoResponse[] = [];
  cargando = false;
  error = '';
  mostrarModal = false;
  editandoRecuerdo: RecuerdoResponse | null = null;
  editTitulo = '';
  editDescripcion = '';
  editFecha = '';
  editImagen: File | null = null;
  editPreview: string | null = null;
  guardandoEdicion = false;
  errorEdicion = '';

  constructor(
    private router: Router,
    private recuerdoService: RecuerdoService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarRecuerdos();
  }

  cargarRecuerdos() {
    this.cargando = true;
    this.error = '';

    this.recuerdoService.getRecuerdos().subscribe({
      next: (recuerdos) => {
        this.recuerdos = recuerdos;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.error = error?.error?.message || 'No se pudieron cargar los recuerdos.';
      }
    });
  }

  crearNuevoRecuerdo() {
    console.log('Abrir modal para crear recuerdo');
  }

  irAMapa() {
    this.router.navigate(['/diario/mapa']);
  }

  goToPlaylist() {
    this.router.navigate(['/playlist']);
  }

  verDetalle(id: number) {
    this.router.navigate(
      ['/diario/recuerdo', id],
      { state: { recuerdos: this.recuerdos } }
    );
  }

  getImagenRecuerdo(recuerdo: RecuerdoResponse): string {
    if (recuerdo.fotoUrl) {
      return this.apiService.getAssetUrl(recuerdo.fotoUrl);
    }
    return '/assets/Recuerdo1.jpeg';
  }

  puedeEditar(recuerdo: RecuerdoResponse): boolean {
    const user = this.authService.getUser();
    return !!user && user.id === recuerdo.usuarioId;
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  abrirEditar(recuerdo: RecuerdoResponse, event: Event) {
    event.stopPropagation();
    this.editandoRecuerdo = recuerdo;
    this.editTitulo = recuerdo.titulo;
    this.editDescripcion = recuerdo.descripcion || '';
    this.editFecha = recuerdo.fechaRecuerdo;
    this.editImagen = null;
    this.editPreview = recuerdo.fotoUrl ? this.apiService.getAssetUrl(recuerdo.fotoUrl) : null;
    this.errorEdicion = '';
  }

  cerrarEditar() {
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
      this.editPreview = this.editandoRecuerdo?.fotoUrl
        ? this.apiService.getAssetUrl(this.editandoRecuerdo.fotoUrl)
        : null;
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

    if (!this.editTitulo.trim() || !this.editFecha) {
      this.errorEdicion = 'Completa titulo y fecha del recuerdo.';
      return;
    }

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    const formData = new FormData();
    formData.append('titulo', this.editTitulo.trim());
    formData.append('descripcion', this.editDescripcion?.trim() || '');
    formData.append('fechaRecuerdo', this.editFecha);
    if (this.editImagen) {
      formData.append('imagen', this.editImagen);
    }

    this.recuerdoService.updateRecuerdo(this.editandoRecuerdo.id, formData).subscribe({
      next: (recuerdoActualizado) => {
        this.recuerdos = this.recuerdos.map((item) =>
          item.id === recuerdoActualizado.id ? recuerdoActualizado : item
        );
        this.guardandoEdicion = false;
        this.cerrarEditar();
      },
      error: (error) => {
        this.guardandoEdicion = false;
        this.errorEdicion = error?.error?.message || 'No se pudo actualizar el recuerdo.';
      }
    });
  }

  eliminarRecuerdo(recuerdo: RecuerdoResponse, event: Event): void {
    event.stopPropagation();
    const confirmar = confirm(`¿Eliminar el recuerdo "${recuerdo.titulo}"?`);
    if (!confirmar) {
      return;
    }

    this.recuerdoService.deleteRecuerdo(recuerdo.id).subscribe({
      next: () => {
        this.recuerdos = this.recuerdos.filter((item) => item.id !== recuerdo.id);
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudo eliminar el recuerdo.';
      }
    });
  }
}
