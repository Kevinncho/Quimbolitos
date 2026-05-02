import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UsuarioResponse } from '../service/auth.service';
import { ParejaResponse, ParejaService } from '../service/pareja.service';
import { AhorcadoEstadoResponse, AhorcadoService } from '../service/ahorcado.service';
import { getAhorcadoWebSocketUrl } from '../config/api.config';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription | null = null;
  private usuarioLocal: UsuarioResponse | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private ws: WebSocket | null = null;

  parejaActiva: ParejaResponse | null = null;

  iniciandoJuego = false;
  errorJuego = '';
  partidaActiva = false;
  soyCreador = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private parejaService: ParejaService,
    private ahorcadoService: AhorcadoService
  ) {}

  ngOnInit(): void {
    this.usuarioLocal = this.authService.getUser();
    this.userSubscription = this.authService.user$.subscribe((usuario) => {
      this.usuarioLocal = usuario;
    });

    this.cargarParejaActiva();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.userSubscription = null;
    this.detenerPolling();
    this.cerrarWebSocket();
  }

  get usuarioActual(): UsuarioResponse | null {
    return this.usuarioLocal;
  }

  get fondoPerfilUsuario(): string {
    const foto = this.authService.resolveFotoPerfilUrl(this.usuarioActual?.fotoPerfil);
    return `url('${foto}')`;
  }

  get fondoPerfilPareja(): string {
    if (!this.parejaActiva) {
      return "url('/assets/sinuser.svg')";
    }

    const usuario = this.usuarioActual;
    if (!usuario) {
      return "url('/assets/sinuser.svg')";
    }

    const fotoPareja = usuario.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosFotoPerfil
      : this.parejaActiva.usuarioUnoFotoPerfil;

    const resolved = this.authService.resolveFotoPerfilUrl(fotoPareja);
    return `url('${resolved}')`;
  }

  irAMiPerfil() {
    this.router.navigate(['/mi-perfil']);
  }

  iniciarJuego(palabra: string, pista: string) {
    if (!palabra.trim() || this.iniciandoJuego) {
      return;
    }

    this.iniciandoJuego = true;
    this.errorJuego = '';

    this.ahorcadoService.iniciar({
      palabra: palabra.trim(),
      pista: pista?.trim() || ''
    }).subscribe({
      next: () => {
        this.iniciandoJuego = false;
        this.partidaActiva = true;
        this.soyCreador = true;
        this.router.navigate(['/ahorcado']);
      },
      error: (error) => {
        this.iniciandoJuego = false;
        this.errorJuego = error?.error?.message || 'No se pudo iniciar el juego.';
      }
    });
  }

  irAJuegoActivo(): void {
    this.router.navigate(['/ahorcado']);
  }

  private cargarParejaActiva(): void {
    this.parejaService.getMyPairs().subscribe({
      next: (parejas) => {
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
        if (this.parejaActiva) {
          this.cargarEstadoJuego();
        } else {
          this.partidaActiva = false;
          this.soyCreador = false;
          this.errorJuego = '';
          this.detenerPolling();
        }
      },
      error: () => {
        this.parejaActiva = null;
        this.partidaActiva = false;
        this.soyCreador = false;
        this.errorJuego = '';
        this.detenerPolling();
      }
    });
  }

  private cargarEstadoJuego(): void {
    const usuario = this.usuarioActual;
    if (!usuario) {
      this.detenerPolling();
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (!this.parejaActiva) {
      this.partidaActiva = false;
      this.soyCreador = false;
      this.errorJuego = '';
      this.detenerPolling();
      return;
    }

    this.ahorcadoService.estado().subscribe({
      next: (estado) => {
        this.errorJuego = '';
        this.actualizarDesdeEstado(estado);
      },
      error: (error) => {
        this.partidaActiva = false;
        this.soyCreador = false;

        if (error?.status === 401) {
          this.detenerPolling();
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        if (error?.status === 403) {
          this.detenerPolling();
          this.errorJuego = '';
          return;
        }

        if (error?.status === 404 || error?.status === 400) {
          this.detenerPolling();
          this.errorJuego = '';
          return;
        }

        this.errorJuego = error?.error?.message || 'Error al obtener el estado del juego.';
      }
    });
  }

  private actualizarDesdeEstado(estado: AhorcadoEstadoResponse): void {
    const usuario = this.usuarioActual;
    this.partidaActiva = estado.estado === 'ACTIVA';
    if (usuario) {
      this.soyCreador = estado.creadorId === usuario.id;
    } else {
      this.soyCreador = false;
    }
  }

  cancelarPartida(): void {
    if (!confirm('¿Deseas cancelar la partida activa?')) {
      return;
    }

    this.ahorcadoService.cancelarPartidaActiva().subscribe({
      next: () => {
        this.partidaActiva = false;
        this.soyCreador = false;
        this.errorJuego = 'Partida cancelada. Ingresa una nueva palabra para comenzar.';
      },
      error: (error) => {
        if (error?.status === 403 || error?.status === 404 || error?.status === 400) {
          this.partidaActiva = false;
          this.soyCreador = false;
          this.errorJuego = 'No hay partida activa para cancelar. El estado local se ha reiniciado.';
          return;
        }

        this.errorJuego = error?.error?.message || 'No se pudo cancelar la partida activa.';
      }
    });
  }

  private conectarWebSocket(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.iniciarPolling();
      return;
    }

    const url = getAhorcadoWebSocketUrl(token);

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.iniciarPolling();
      return;
    }

    this.ws.onmessage = (event) => {
      try {
        const estado = JSON.parse(event.data) as AhorcadoEstadoResponse;
        this.actualizarDesdeEstado(estado);
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.iniciarPolling();
    };

    this.ws.onerror = () => {
      this.cerrarWebSocket();
      this.iniciarPolling();
    };
  }

  private cerrarWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private iniciarPolling(): void {
    if (this.pollIntervalId) {
      return;
    }
    this.pollIntervalId = setInterval(() => this.cargarEstadoJuego(), 2000);
  }

  private detenerPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
