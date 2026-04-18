import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TemaService, CreateTemaRequest } from '../service/tema.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-tema',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-tema.component.html',
  styleUrl: './crear-tema.component.css'
})
export class CrearTemaComponent {
  temaData: CreateTemaRequest = {
    nombre: '',
    descripcion: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private temaService: TemaService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.temaData.nombre.trim()) {
      this.errorMessage = 'El nombre del tema es obligatorio';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.temaService.createTema(this.temaData).subscribe({
      next: (tema) => {
        this.isLoading = false;
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al crear el tema. Inténtalo de nuevo.';
        console.error('Error creating tema:', error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/inicio']);
  }
}
