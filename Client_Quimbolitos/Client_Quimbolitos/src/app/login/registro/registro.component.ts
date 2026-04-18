import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registerData: RegisterRequest = {
    nombre: '',
    alias: '',
    email: '',
    password: '',
    fechaNacimiento: '',
    biografia: '',
    fotoPerfil: ''
  };

  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  fotoPerfilFile: File | null = null;
  fotoPerfilPreview: string | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  onFotoPerfilSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.fotoPerfilFile = file;

    if (!file) {
      this.fotoPerfilPreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPerfilPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRegister(): void {
    if (!this.registerData.nombre || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Completa nombre, correo y contraseña.';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: RegisterRequest = {
      nombre: this.registerData.nombre.trim(),
      alias: this.registerData.alias?.trim() || undefined,
      email: this.registerData.email.trim(),
      password: this.registerData.password,
      fechaNacimiento: this.registerData.fechaNacimiento || '',
      biografia: this.registerData.biografia?.trim() || undefined,
      fotoPerfil: undefined
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        if (this.fotoPerfilFile) {
          this.usuarioService.uploadFotoPerfil(this.fotoPerfilFile).subscribe({
            next: (usuarioActualizado) => {
              this.authService.saveUser(usuarioActualizado);
              this.isLoading = false;
              this.router.navigate(['/inicio']);
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = error?.error?.message || 'No se pudo subir la foto de perfil.';
            }
          });
          return;
        }

        this.authService.saveUser(response.usuario);
        this.isLoading = false;
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = error?.error?.message || 'Revisa los datos del formulario.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar al servidor.';
        } else {
          this.errorMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        }
      }
    });
  }
}
