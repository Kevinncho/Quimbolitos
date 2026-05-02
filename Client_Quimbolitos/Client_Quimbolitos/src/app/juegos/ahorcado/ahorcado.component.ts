import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AhorcadoEstadoResponse, AhorcadoHistorialItem, AhorcadoService } from '../../service/ahorcado.service';
import { AuthService, UsuarioResponse } from '../../service/auth.service';
import { ParejaResponse, ParejaService } from '../../service/pareja.service';
import { getAhorcadoWebSocketUrl } from '../../config/api.config';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit, OnDestroy {

  palabraSecreta = '';
  pista = '';

  palabraVisible: string[] = [];
  letrasUsadas: string[] = [];

  errores = 0;
  maxErrores = 6;

  juegoTerminado = false;
  gano = false;

  musicaIniciada = false;
  cargandoEstado = false;
  sinPartida = false;
  errorEstado = '';
  private estadoActual: AhorcadoEstadoResponse | null = null;
  historial: AhorcadoHistorialItem[] = [];
  mostrarCrear = false;
  nuevaPalabra = '';
  nuevaPista = '';
  guardandoNueva = false;
  errorNueva = '';
  mostrarHistorial = false;

  private keyListener!: (event: KeyboardEvent) => void;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private ws: WebSocket | null = null;
  private userSubscription: Subscription | null = null;
  private usuarioLocal: UsuarioResponse | null = null;
  parejaActiva: ParejaResponse | null = null;
  audioAmbiente!: HTMLAudioElement;

  constructor(
    private router: Router,
    private ahorcadoService: AhorcadoService,
    private authService: AuthService,
    private parejaService: ParejaService
  ) {}

  ngOnInit() {
    this.audioAmbiente = new Audio('/assets/audio/ambiente_ahorcado.mp3');
    this.audioAmbiente.loop = true;
    this.audioAmbiente.volume = 0.18;
    this.audioAmbiente.load();

    this.usuarioLocal = this.authService.getUser();
    this.userSubscription = this.authService.user$.subscribe((usuario) => {
      this.usuarioLocal = usuario;
    });
    this.cargarParejaActiva();

    this.cargarEstado();
    this.conectarWebSocket();
    this.cargarHistorial();

    this.keyListener = (event: KeyboardEvent) => {
      const letra = event.key.toUpperCase();
      if (letra >= 'A' && letra <= 'Z') {
        if (!this.musicaIniciada) {
          this.iniciarAudio();
        }
        this.jugarLetra(letra);
      }
    };

    window.addEventListener('keydown', this.keyListener);
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.keyListener);
    this.detenerPolling();
    this.cerrarWebSocket();
    this.userSubscription?.unsubscribe();
    this.userSubscription = null;
    if (this.audioAmbiente) {
      this.audioAmbiente.pause();
    }
  }

  jugarLetra(letra: string) {
    if (this.juegoTerminado || this.sinPartida) return;
    if (!this.puedeJugar) return;
    if (this.letrasUsadas.includes(letra)) return;

    this.errorEstado = '';

    this.ahorcadoService.jugar({ letra }).subscribe({
      next: (estado) => {
        this.aplicarEstado(estado);
      },
      error: (error) => {
        if (error?.status === 403) {
          this.refrescarEstado();
          return;
        }
        if (error?.status === 404) {
          this.sinPartida = true;
          return;
        }
        this.errorEstado = error?.error?.message || 'No se pudo actualizar el juego.';
      }
    });
  }

  reiniciar() {
    if (!this.puedeReiniciar) {
      return;
    }
    this.mostrarCrear = true;
  }

  volverAJuegos() {
    this.router.navigate(['/juegos']);
  }

  cancelarNueva(): void {
    this.mostrarCrear = false;
    this.nuevaPalabra = '';
    this.nuevaPista = '';
    this.errorNueva = '';
  }

  abrirHistorial(): void {
    if (this.juegoTerminado && this.historialFinalizado.length > 0) {
      this.mostrarHistorial = true;
    }
  }

  cerrarHistorial(): void {
    this.mostrarHistorial = false;
  }

  eliminarHistorial(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar todo el historial de partidas?')) {
      return;
    }

    this.ahorcadoService.borrarHistorial().subscribe({
      next: () => {
        this.historial = [];
        this.mostrarHistorial = false;
        this.cargarHistorial();
      },
      error: (error) => {
        console.error('Error eliminar historial:', error);
        this.errorEstado = error?.error?.message || 'No se pudo eliminar el historial.';
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mostrarHistorial) {
      this.cerrarHistorial();
    }
  }

  guardarNueva(): void {
    if (!this.nuevaPalabra.trim() || this.guardandoNueva) {
      return;
    }

    this.guardandoNueva = true;
    this.errorNueva = '';

    this.ahorcadoService.iniciar({
      palabra: this.nuevaPalabra.trim(),
      pista: this.nuevaPista.trim()
    }).subscribe({
      next: (estado) => {
        this.guardandoNueva = false;
        this.mostrarCrear = false;
        this.nuevaPalabra = '';
        this.nuevaPista = '';
        this.aplicarEstado(estado);
        this.cargarHistorial();
      },
      error: (error) => {
        this.guardandoNueva = false;
        this.errorNueva = error?.error?.message || 'No se pudo crear la nueva partida.';
      }
    });
  }

  iniciarAudio() {
    if (!this.musicaIniciada) {
      this.audioAmbiente.play()
        .then(() => {
          this.musicaIniciada = true;
        })
        .catch(err => {
          console.error('Error al reproducir:', err);
        });
    }
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

  get nombreUsuario(): string {
    return this.usuarioActual?.nombre || 'Tu';
  }

  get nombrePareja(): string {
    if (!this.parejaActiva || !this.usuarioActual) {
      return 'Tu pareja';
    }
    return this.usuarioActual.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosNombre
      : this.parejaActiva.usuarioUnoNombre;
  }

  get esCreador(): boolean {
    const usuario = this.usuarioActual;
    if (!usuario || !this.estadoActual) {
      return false;
    }
    return this.estadoActual.creadorId === usuario.id;
  }

  get puedeJugar(): boolean {
    const usuario = this.usuarioActual;
    if (!usuario) {
      return false;
    }
    if (this.sinPartida || this.juegoTerminado) {
      return false;
    }
    return this.estadoAdivinadorId === usuario.id;
  }

  get puedeReiniciar(): boolean {
    const usuario = this.usuarioActual;
    if (!usuario || !this.estadoActual || !this.juegoTerminado) {
      return false;
    }

    return this.estadoActual.creadorId === usuario.id || this.estadoActual.adivinadorId === usuario.id;
  }

  private get estadoAdivinadorId(): number | null {
    return this.estadoActual?.adivinadorId ?? null;
  }

  private cargarEstado(): void {
    this.cargandoEstado = true;
    this.errorEstado = '';
    this.sinPartida = false;

    this.ahorcadoService.estado().subscribe({
      next: (estado) => {
        this.cargandoEstado = false;
        this.aplicarEstado(estado);
      },
      error: (error) => {
        this.cargandoEstado = false;
        if (error?.status === 404) {
          this.sinPartida = true;
        } else if (error?.status === 403) {
          this.errorEstado = error?.error?.message || 'No tienes permiso para acceder al juego.';
          this.detenerPolling();
        } else {
          this.errorEstado = error?.error?.message || 'No se pudo cargar el juego.';
        }
      }
    });
  }

  private refrescarEstado(): void {
    if (this.sinPartida) {
      return;
    }

    this.ahorcadoService.estado().subscribe({
      next: (estado) => {
        this.aplicarEstado(estado);
      },
      error: (error) => {
        if (error?.status === 404) {
          this.sinPartida = true;
        } else if (error?.status === 403) {
          this.errorEstado = error?.error?.message || 'No tienes permiso para acceder al juego.';
          this.detenerPolling();
        }
      }
    });
  }

  private aplicarEstado(estado: AhorcadoEstadoResponse): void {
    this.estadoActual = estado;
    this.errorEstado = '';
    this.sinPartida = false;
    this.pista = estado.pista || '';
    this.palabraVisible = estado.palabraVisible || [];
    this.letrasUsadas = estado.letrasUsadas || [];
    this.errores = estado.errores ?? 0;
    this.maxErrores = estado.maxErrores ?? 6;
    this.juegoTerminado = estado.terminado;
    this.gano = estado.gano;
    if (estado.palabraSecreta) {
      this.palabraSecreta = estado.palabraSecreta;
    }
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
    this.pollIntervalId = setInterval(() => this.refrescarEstado(), 1500);
  }

  private detenerPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private cargarParejaActiva(): void {
    this.parejaService.getMyPairs().subscribe({
      next: (parejas) => {
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
      },
      error: () => {
        this.parejaActiva = null;
      }
    });
  }

  private cargarHistorial(): void {
    this.ahorcadoService.historial().subscribe({
      next: (items) => {
        this.historial = items || [];
      },
      error: () => {
        this.historial = [];
      }
    });
  }

  get historialFinalizado(): AhorcadoHistorialItem[] {
    return this.historial.filter((item) => item.estado !== 'ACTIVA');
  }
}
