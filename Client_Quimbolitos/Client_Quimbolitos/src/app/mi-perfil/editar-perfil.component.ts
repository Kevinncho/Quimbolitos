import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UsuarioResponse } from '../service/auth.service';
import { UpdateUsuarioRequest, UsuarioService } from '../service/usuario.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent implements OnInit {
  usuario: UsuarioResponse | null = null;
  cargando = true;
  guardando = false;
  error = '';
  success = '';
  debeReiniciarSesion = false;
  subiendoFoto = false;
  fotoPerfilPreview: string | null = null;

  form: UpdateUsuarioRequest = {
    nombre: '',
    alias: '',
    email: '',
    fechaNacimiento: '',
    biografia: '',
    fotoPerfil: '',
    password: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  get aliasMostrado(): string {
    return this.form.alias?.trim() || this.form.nombre?.trim() || 'Sin alias';
  }

  get fotoPerfilActual(): string {
    if (this.fotoPerfilPreview) {
      return this.fotoPerfilPreview;
    }
    return this.authService.resolveFotoPerfilUrl(this.form.fotoPerfil);
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.usuarioService.getMiPerfil().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.fotoPerfilPreview = null;
        this.form = {
          nombre: usuario.nombre ?? '',
          alias: usuario.alias ?? '',
          email: usuario.email ?? '',
          fechaNacimiento: usuario.fechaNacimiento ?? '',
          biografia: usuario.biografia ?? '',
          fotoPerfil: usuario.fotoPerfil ?? '',
          password: ''
        };
        this.authService.saveUser(usuario);
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudo cargar tu perfil.';
        this.cargando = false;
      }
    });
  }

  onFotoPerfilSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (this.subiendoFoto) {
      return;
    }

    if (!file) {
      this.fotoPerfilPreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPerfilPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.subiendoFoto = true;
    this.error = '';
    this.success = '';

    this.usuarioService.uploadFotoPerfil(file).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        this.form.fotoPerfil = usuarioActualizado.fotoPerfil ?? '';
        this.authService.saveUser(usuarioActualizado);
        this.success = 'Foto de perfil actualizada correctamente.';
        this.subiendoFoto = false;
      },
      error: (error) => {
        this.subiendoFoto = false;
        this.error = error?.error?.message || 'No se pudo subir la foto de perfil.';
      }
    });
  }

  guardarPerfil(): void {
    if (this.guardando || this.subiendoFoto) {
      return;
    }

    this.guardando = true;
    this.error = '';
    this.success = '';
    this.debeReiniciarSesion = false;
    const emailOriginal = this.usuario?.email ?? '';

    const payload: UpdateUsuarioRequest = {
      nombre: this.form.nombre?.trim(),
      alias: this.form.alias?.trim(),
      email: this.form.email?.trim(),
      fechaNacimiento: this.form.fechaNacimiento || undefined,
      biografia: this.form.biografia?.trim(),
      fotoPerfil: this.form.fotoPerfil?.trim(),
      password: this.form.password?.trim() || undefined
    };

    this.usuarioService.updateMiPerfil(payload).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        this.authService.saveUser(usuarioActualizado);
        this.form.password = '';
        this.guardando = false;

        if (emailOriginal && emailOriginal !== usuarioActualizado.email) {
          this.debeReiniciarSesion = true;
          this.success = 'Perfil guardado. Como cambiaste el correo, cierra sesion y vuelve a entrar.';
          return;
        }

        this.success = 'Perfil guardado correctamente.';
        this.router.navigate(['/mi-perfil']);
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No se pudo guardar el perfil.';
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
