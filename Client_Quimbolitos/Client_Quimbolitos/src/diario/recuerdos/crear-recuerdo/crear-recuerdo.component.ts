import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecuerdoService } from '../../../app/service/recuerdo.service';

@Component({
  selector: 'app-crear-recuerdo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-recuerdo.component.html',
  styleUrl: './crear-recuerdo.component.css'
})
export class CrearRecuerdoComponent {
  @Output() cerrar = new EventEmitter<void>();

  titulo = '';
  descripcion = '';
  fecha = '';
  imagen: File | null = null;
  preview: string | null = null;
  guardando = false;
  error = '';

  constructor(
    private router: Router,
    private recuerdoService: RecuerdoService
  ) {}

  cerrarFormulario(): void {
    this.cerrar.emit();
    this.router.navigate(['/diario']);
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

  guardarRecuerdo(): void {
    if (this.guardando) {
      return;
    }

    if (!this.titulo.trim() || !this.fecha) {
      this.error = 'Completa titulo y fecha del recuerdo.';
      return;
    }

    this.guardando = true;
    this.error = '';

    const formData = new FormData();
    formData.append('titulo', this.titulo.trim());
    formData.append('descripcion', this.descripcion?.trim() || '');
    formData.append('fechaRecuerdo', this.fecha);
    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }

    this.recuerdoService.createRecuerdo(formData).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/diario']);
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No se pudo guardar el recuerdo.';
      }
    });
  }
}
