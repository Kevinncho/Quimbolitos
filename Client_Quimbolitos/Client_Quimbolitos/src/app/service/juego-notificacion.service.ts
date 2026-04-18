import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService, UsuarioResponse } from './auth.service';
import { AhorcadoEstadoResponse, AhorcadoService } from './ahorcado.service';

@Injectable({
  providedIn: 'root'
})
export class JuegoNotificacionService {
  private readonly toastSubject = new Subject<string>();
  readonly toast$ = this.toastSubject.asObservable();

  private ws: WebSocket | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private usuarioActual: UsuarioResponse | null = null;
  private lastNotifiedPartidaId: number | null = null;

  constructor(
    private authService: AuthService,
    private ahorcadoService: AhorcadoService
  ) {
    this.authService.user$.subscribe((usuario) => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.conectar();
      } else {
        this.cerrar();
      }
    });
  }

  private conectar(): void {
    if (this.ws) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.iniciarPolling();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname || 'localhost';
    const url = `${protocol}://${host}:8080/ws/ahorcado?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.iniciarPolling();
      return;
    }

    this.ws.onmessage = (event) => {
      try {
        const estado = JSON.parse(event.data) as AhorcadoEstadoResponse;
        this.manejarEstado(estado);
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.iniciarPolling();
    };

    this.ws.onerror = () => {
      this.cerrar();
      this.iniciarPolling();
    };
  }

  private cerrar(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.detenerPolling();
  }

  private iniciarPolling(): void {
    if (this.pollIntervalId) {
      return;
    }
    this.pollIntervalId = setInterval(() => this.refrescarEstado(), 4000);
  }

  private detenerPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private refrescarEstado(): void {
    this.ahorcadoService.estado().subscribe({
      next: (estado) => this.manejarEstado(estado),
      error: () => {
        // no-op
      }
    });
  }

  private manejarEstado(estado: AhorcadoEstadoResponse): void {
    const usuario = this.usuarioActual;
    if (!usuario) {
      return;
    }

    if (estado.estado !== 'ACTIVA') {
      return;
    }

    if (estado.adivinadorId !== usuario.id) {
      return;
    }

    if (this.lastNotifiedPartidaId === estado.id) {
      return;
    }

    this.lastNotifiedPartidaId = estado.id;
    this.toastSubject.next('Tu pareja inició una partida');
  }
}
