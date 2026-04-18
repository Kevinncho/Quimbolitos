import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UsuarioResponse } from '../service/auth.service';
import { UsuarioService } from '../service/usuario.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  usuario: UsuarioResponse | null = null;
  cargando = true;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  get nombre(): string {
    return this.usuario?.nombre || 'Tu nombre';
  }

  get alias(): string {
    return this.usuario?.alias || this.usuario?.nombre || 'Sin alias';
  }

  get correo(): string {
    return this.usuario?.email || 'Sin correo';
  }

  get descripcion(): string {
    return this.usuario?.biografia || 'Guardian del reino, creador de recuerdos y companero de aventuras.';
  }

  get fotoPerfil(): string {
    return this.authService.resolveFotoPerfilUrl(this.usuario?.fotoPerfil);
  }

  get fechaNacimiento(): string {
    return this.usuario?.fechaNacimiento || 'Sin definir';
  }

  private cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.usuarioService.getMiPerfil().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.authService.saveUser(usuario);
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No se pudo cargar tu perfil.';
        this.cargando = false;
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
