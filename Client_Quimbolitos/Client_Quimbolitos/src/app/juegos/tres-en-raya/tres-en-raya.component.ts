import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UsuarioResponse } from '../../service/auth.service';
import { ParejaResponse, ParejaService } from '../../service/pareja.service';
import { TresEnRayaEstadoResponse, TresEnRayaService } from '../../service/tres-en-raya.service';
import { getTresEnRayaWebSocketUrl } from '../../config/api.config';

@Component({
  selector: 'app-tres-en-raya',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './tres-en-raya.component.html',
  styleUrl: './tres-en-raya.component.css'
})
export class TresEnRayaComponent implements OnInit, OnDestroy {
  readonly boardIndices = Array.from({ length: 9 }, (_, index) => index);

  estado: TresEnRayaEstadoResponse | null = null;
  parejaActiva: ParejaResponse | null = null;
  cargandoEstado = true;
  creandoPartida = false;
  accionEnCurso = false;
  sinPartida = false;
  sinParejaActiva = false;
  errorEstado = '';

  private userSubscription: Subscription | null = null;
  private usuarioLocal: UsuarioResponse | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private ws: WebSocket | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private parejaService: ParejaService,
    private tresEnRayaService: TresEnRayaService
  ) {}

  ngOnInit(): void {
    this.usuarioLocal = this.authService.getUser();
    this.userSubscription = this.authService.user$.subscribe((usuario) => {
      this.usuarioLocal = usuario;
    });

    this.cargarParejaActiva();
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
    if (!this.parejaActiva || !this.usuarioActual) {
      return "url('/assets/sinuser.svg')";
    }

    const fotoPareja = this.usuarioActual.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosFotoPerfil
      : this.parejaActiva.usuarioUnoFotoPerfil;

    return `url('${this.authService.resolveFotoPerfilUrl(fotoPareja)}')`;
  }

  get nombreUsuario(): string {
    return this.usuarioActual?.nombre || 'Tú';
  }

  get nombrePareja(): string {
    if (!this.parejaActiva || !this.usuarioActual) {
      return 'Tu pareja';
    }
    return this.usuarioActual.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosNombre
      : this.parejaActiva.usuarioUnoNombre;
  }

  get tablero(): string[] {
    return this.estado?.tablero ?? Array.from({ length: 9 }, () => '');
  }

  get miSimbolo(): 'X' | 'O' | null {
    if (!this.estado || !this.usuarioActual) {
      return null;
    }
    if (this.estado.jugadorXId === this.usuarioActual.id) {
      return 'X';
    }
    if (this.estado.jugadorOId === this.usuarioActual.id) {
      return 'O';
    }
    return null;
  }

  get simboloPareja(): 'X' | 'O' | null {
    if (this.miSimbolo === 'X') {
      return 'O';
    }
    if (this.miSimbolo === 'O') {
      return 'X';
    }
    return null;
  }

  get esMiTurno(): boolean {
    return !!this.estado && !!this.usuarioActual && this.estado.turnoJugadorId === this.usuarioActual.id && !this.estado.terminado;
  }

  get puedeCrearPartida(): boolean {
    return !this.cargandoEstado && this.sinPartida && !this.sinParejaActiva && !this.creandoPartida;
  }

  get puedeJugar(): boolean {
    return !!this.estado && this.esMiTurno && !this.accionEnCurso;
  }

  get statusText(): string {
    if (this.sinParejaActiva) {
      return 'Necesitas una pareja activa';
    }

    if (this.sinPartida) {
      return 'Sin partida activa';
    }

    if (!this.estado) {
      return 'Cargando tablero';
    }

    if (this.estado.estado === 'EMPATE') {
      return 'Empate';
    }

    if (this.estado.ganador) {
      return `Gana ${this.nombreGanador}`;
    }

    return this.esMiTurno ? `Tu turno con ${this.miSimbolo}` : `Turno de ${this.nombreTurno}`;
  }

  get statusDetail(): string {
    if (this.sinParejaActiva) {
      return 'Activa una pareja para crear una partida multijugador.';
    }

    if (this.sinPartida) {
      return 'Crea una partida para que tu pareja entre y jueguen por turnos.';
    }

    if (!this.estado || !this.usuarioActual) {
      return 'Esperando sincronización del tablero.';
    }

    if (this.estado.estado === 'EMPATE') {
      return 'La ronda terminó sin ganador. Pueden abrir una nueva ronda.';
    }

    if (this.estado.ganador) {
      return this.miSimbolo === this.estado.ganador
        ? 'Ganaste esta ronda. Puedes iniciar otra.'
        : 'Tu pareja ganó esta ronda. Pueden revanchar cuando quieran.';
    }

    return this.esMiTurno
      ? 'Elige una casilla vacía para hacer tu jugada.'
      : 'Espera a que tu pareja haga su movimiento.';
  }

  get nombreTurno(): string {
    if (!this.estado || !this.usuarioActual) {
      return 'jugador';
    }
    return this.estado.turnoJugadorId === this.usuarioActual.id ? this.nombreUsuario : this.nombrePareja;
  }

  get nombreGanador(): string {
    if (!this.estado?.ganador) {
      return 'nadie';
    }
    return this.estado.ganador === this.miSimbolo ? this.nombreUsuario : this.nombrePareja;
  }

  irAMiPerfil(): void {
    this.router.navigate(['/mi-perfil']);
  }

  volverAJuegos(): void {
    this.router.navigate(['/juegos']);
  }

  crearPartida(): void {
    if (!this.puedeCrearPartida) {
      return;
    }

    this.creandoPartida = true;
    this.errorEstado = '';

    this.tresEnRayaService.iniciar().subscribe({
      next: (estado) => {
        this.creandoPartida = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.creandoPartida = false;
        this.errorEstado = error?.error?.message || 'No se pudo iniciar la partida.';
      }
    });
  }

  play(index: number): void {
    if (!this.puedeJugar || this.tablero[index]) {
      return;
    }

    this.accionEnCurso = true;
    this.errorEstado = '';

    this.tresEnRayaService.jugar(index).subscribe({
      next: (estado) => {
        this.accionEnCurso = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.accionEnCurso = false;
        if (error?.status === 404) {
          this.sinPartida = true;
          this.estado = null;
          return;
        }
        if (error?.status === 403) {
          this.refrescarEstado();
          return;
        }
        this.errorEstado = error?.error?.message || 'No se pudo registrar la jugada.';
      }
    });
  }

  nuevaRonda(): void {
    if (!this.estado?.terminado || this.accionEnCurso) {
      return;
    }

    this.accionEnCurso = true;
    this.errorEstado = '';

    this.tresEnRayaService.nuevaRonda().subscribe({
      next: (estado) => {
        this.accionEnCurso = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.accionEnCurso = false;
        this.errorEstado = error?.error?.message || 'No se pudo iniciar la nueva ronda.';
      }
    });
  }

  reiniciarSerie(): void {
    if (!this.estado || this.accionEnCurso) {
      return;
    }

    this.accionEnCurso = true;
    this.errorEstado = '';

    this.tresEnRayaService.reiniciarSerie().subscribe({
      next: (estado) => {
        this.accionEnCurso = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.accionEnCurso = false;
        this.errorEstado = error?.error?.message || 'No se pudo reiniciar la serie.';
      }
    });
  }

  cancelarPartida(): void {
    if (!this.estado || this.accionEnCurso) {
      return;
    }

    if (!confirm('¿Deseas cancelar la partida activa de tres en raya?')) {
      return;
    }

    this.accionEnCurso = true;
    this.errorEstado = '';

    this.tresEnRayaService.cancelarPartidaActiva().subscribe({
      next: () => {
        this.accionEnCurso = false;
        this.estado = null;
        this.sinPartida = true;
      },
      error: (error) => {
        this.accionEnCurso = false;
        this.errorEstado = error?.error?.message || 'No se pudo cancelar la partida.';
      }
    });
  }

  isWinningCell(index: number): boolean {
    return this.estado?.winningCells?.includes(index) ?? false;
  }

  private cargarParejaActiva(): void {
    this.parejaService.getMyPairs().subscribe({
      next: (parejas) => {
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
        this.sinParejaActiva = !this.parejaActiva;

        if (!this.parejaActiva) {
          this.cargandoEstado = false;
          this.estado = null;
          this.sinPartida = true;
          this.errorEstado = '';
          this.detenerPolling();
          this.cerrarWebSocket();
          return;
        }

        this.cargarEstado();
        this.conectarWebSocket();
      },
      error: () => {
        this.parejaActiva = null;
        this.sinParejaActiva = true;
        this.sinPartida = true;
        this.cargandoEstado = false;
        this.errorEstado = 'No se pudo comprobar tu pareja activa.';
      }
    });
  }

  private cargarEstado(): void {
    this.cargandoEstado = true;
    this.errorEstado = '';

    this.tresEnRayaService.estado().subscribe({
      next: (estado) => {
        this.cargandoEstado = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.cargandoEstado = false;
        if (error?.status === 404) {
          this.sinPartida = true;
          this.estado = null;
          return;
        }
        if (error?.status === 403) {
          this.estado = null;
          this.sinPartida = true;
          if (!this.parejaActiva) {
            this.sinParejaActiva = true;
            this.errorEstado = 'Necesitas una pareja activa para jugar tres en raya.';
            return;
          }
          this.sinParejaActiva = false;
          this.errorEstado = '';
          return;
        }
        this.errorEstado = error?.error?.message || 'No se pudo cargar el tres en raya.';
      }
    });
  }

  private refrescarEstado(): void {
    this.tresEnRayaService.estado().subscribe({
      next: (estado) => this.aplicarEstado(estado),
      error: (error) => {
        if (error?.status === 404) {
          this.sinPartida = true;
          this.estado = null;
          return;
        }
        if (error?.status === 403) {
          this.estado = null;
          this.sinPartida = true;
          if (!this.parejaActiva) {
            this.sinParejaActiva = true;
            return;
          }
          this.sinParejaActiva = false;
        }
      }
    });
  }

  private aplicarEstado(estado: TresEnRayaEstadoResponse): void {
    this.estado = estado;
    this.sinPartida = false;
    this.sinParejaActiva = false;
    this.errorEstado = '';
  }

  private conectarWebSocket(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.iniciarPolling();
      return;
    }

    const url = getTresEnRayaWebSocketUrl(token);
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.iniciarPolling();
      return;
    }

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as TresEnRayaEstadoResponse | { cancelled?: boolean } | null;
        if (payload && 'cancelled' in payload && payload.cancelled) {
          this.estado = null;
          this.sinPartida = true;
          this.errorEstado = '';
          return;
        }
        const estado = payload as TresEnRayaEstadoResponse;
        this.aplicarEstado(estado);
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
    this.pollIntervalId = setInterval(() => this.refrescarEstado(), 1800);
  }

  private detenerPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
