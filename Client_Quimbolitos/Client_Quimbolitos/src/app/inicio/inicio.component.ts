import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { AuthService, UsuarioResponse } from '../service/auth.service';
import { EstadoEmocionalResponse, EstadoEmocionalService } from '../service/estado-emocional.service';
import { ParejaService, ParejaResponse } from '../service/pareja.service';
import { PreguntaResponse, PreguntaService } from '../service/pregunta.service';
import { RespuestaResponse, RespuestaService } from '../service/respuesta.service';
import { SubtemaResponse, SubtemaService } from '../service/subtema.service';
import { TemaResponse, TemaService } from '../service/tema.service';
import { UsuarioService } from '../service/usuario.service';

type EstadoUi = {
  usuarioId: number;
  usuario: string;
  estado: string;
  emoji: string;
};

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HeaderComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy {
  private readonly subtemaTarjetaDescripcion = 'Preguntas variadas';
  private cuentaRegresivaIntervalId: ReturnType<typeof setInterval> | null = null;

  mostrarInput = false;
  respuesta = '';
  preguntaInicio: PreguntaResponse | null = null;
  respuestaInicioId: number | null = null;
  respuestasPreguntaInicio: RespuestaResponse[] = [];
  respuestaUsuarioActual: RespuestaResponse | null = null;
  respuestaPareja: RespuestaResponse | null = null;
  mostrarResultados = false;
  cargandoPreguntaInicio = false;
  guardandoPreguntaInicio = false;
  errorPreguntaInicio = '';
  successPreguntaInicio = '';
  errorEstadoEmocional = '';
  tiempoRestantePregunta = '';
  private lastRespuestasRefresh = 0;

  estados: EstadoUi[] = [];
  listaEmojis = ['😊', '😂', '😢', '😴', '😡', '😍'];
  mostrarSelectorEmoji: boolean[] = [];

  emojiEstadoMap: Record<string, string> = {
    '😊': 'Feliz',
    '😂': 'Contento',
    '😢': 'Triste',
    '😴': 'Cansado',
    '😡': 'Enojado',
    '😍': 'Enamorado'
  };

  emojiColorMap: Record<string, string> = {
    '😊': 'emoji-feliz',
    '😂': 'emoji-risa',
    '😢': 'emoji-triste',
    '😴': 'emoji-cansado',
    '😡': 'emoji-enojado',
    '😍': 'emoji-enamorado'
  };

  distanciaKm: number | null = null;
  mensajeRefugio = '';
  editando = false;
  abriendoLlave = false;
  mostrarMensaje = false;

  mostrarPanelPareja = false;
  parejaActiva: ParejaResponse | null = null;
  invitacionPendienteRecibida: ParejaResponse | null = null;
  invitacionPendienteEnviada: ParejaResponse | null = null;
  cargandoPareja = false;
  procesandoPareja = false;
  mensajePareja = '';
  errorPareja = '';
  emailInvitacion = '';
  usuarioEncontrado: UsuarioResponse | null = null;
  buscandoUsuario = false;
  private userSubscription: Subscription | null = null;
  private usuarioLocal: UsuarioResponse | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private parejaService: ParejaService,
    private estadoEmocionalService: EstadoEmocionalService,
    private temaService: TemaService,
    private subtemaService: SubtemaService,
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService
  ) {}

  ngOnInit(): void {
    this.usuarioLocal = this.authService.getUser();
    this.userSubscription = this.authService.user$.subscribe((usuario) => {
      this.usuarioLocal = usuario;
    });

    this.obtenerDistancia();
    this.cargarEstadoPareja();
    this.cargarPreguntaInicio();
    this.iniciarCuentaRegresivaPregunta();

    const guardado = localStorage.getItem('mensajeRefugio');
    if (guardado) {
      this.mensajeRefugio = guardado;
    } else {
      this.editando = true;
    }
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.userSubscription = null;

    if (this.cuentaRegresivaIntervalId) {
      clearInterval(this.cuentaRegresivaIntervalId);
      this.cuentaRegresivaIntervalId = null;
    }
  }

  get usuarioActual(): UsuarioResponse | null {
    return this.usuarioLocal;
  }

  get nombrePareja(): string {
    const usuario = this.usuarioActual;
    if (!usuario || !this.parejaActiva) {
      return 'Conectado';
    }

    return this.parejaActiva.usuarioUnoId === usuario.id
      ? this.parejaActiva.usuarioDosNombre
      : this.parejaActiva.usuarioUnoNombre;
  }

  get puedeMostrarConexion(): boolean {
    return !this.parejaActiva;
  }

  get tieneActividadPareja(): boolean {
    return !!(this.parejaActiva || this.invitacionPendienteRecibida || this.invitacionPendienteEnviada);
  }

  get tieneParejaActiva(): boolean {
    return this.parejaActiva?.estado === 'ACTIVA';
  }

  get puedeVerResultados(): boolean {
    return !!(this.tieneParejaActiva && this.respuestaUsuarioActual && this.respuestaPareja);
  }

  get estadoResultadosTexto(): string | null {
    if (!this.tieneParejaActiva) {
      return null;
    }

    if (this.respuestaUsuarioActual && !this.respuestaPareja) {
      return 'Esperando la respuesta de tu pareja...';
    }

    if (!this.respuestaUsuarioActual && this.respuestaPareja) {
      return 'Tu pareja ya respondio. Te toca a ti.';
    }

    return null;
  }

  get fondoPerfilPareja(): string {
    if (!this.tieneParejaActiva || !this.parejaActiva) {
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

  get fondoPerfilUsuario(): string {
    const foto = this.authService.resolveFotoPerfilUrl(this.usuarioActual?.fotoPerfil);
    return `url('${foto}')`;
  }

  togglePanelPareja(): void {
    this.mostrarPanelPareja = !this.mostrarPanelPareja;
    this.mensajePareja = '';
    this.errorPareja = '';
  }

  cerrarPanelPareja(): void {
    this.mostrarPanelPareja = false;
    this.mensajePareja = '';
    this.errorPareja = '';
  }

  abrirResultados(): void {
    if (!this.puedeVerResultados) {
      return;
    }
    this.mostrarResultados = true;
  }

  cerrarResultados(): void {
    this.mostrarResultados = false;
  }

  buscarUsuarioInvitacion(): void {
    if (!this.emailInvitacion.trim() || this.buscandoUsuario) {
      return;
    }

    this.buscandoUsuario = true;
    this.errorPareja = '';
    this.mensajePareja = '';
    this.usuarioEncontrado = null;

    this.usuarioService.buscarPorEmail(this.emailInvitacion.trim()).subscribe({
      next: (usuario) => {
        this.buscandoUsuario = false;
        this.usuarioEncontrado = usuario;
      },
      error: (error) => {
        this.buscandoUsuario = false;
        this.errorPareja = error?.error?.message || 'No se encontro ningun usuario con ese correo.';
      }
    });
  }

  enviarInvitacion(): void {
    if (!this.usuarioEncontrado || this.procesandoPareja) {
      return;
    }

    this.procesandoPareja = true;
    this.errorPareja = '';
    this.mensajePareja = '';

    this.parejaService.createInvitation({ usuarioInvitadoId: this.usuarioEncontrado.id }).subscribe({
      next: () => {
        this.procesandoPareja = false;
        this.mensajePareja = `Invitacion enviada a ${this.usuarioEncontrado?.nombre}.`;
        this.usuarioEncontrado = null;
        this.emailInvitacion = '';
        this.cargarEstadoPareja();
      },
      error: (error) => {
        this.procesandoPareja = false;
        this.errorPareja = error?.error?.message || 'No se pudo enviar la invitacion.';
      }
    });
  }

  aceptarInvitacion(): void {
    if (!this.invitacionPendienteRecibida || this.procesandoPareja) {
      return;
    }

    this.procesandoPareja = true;
    this.errorPareja = '';

    this.parejaService.acceptInvitation(this.invitacionPendienteRecibida.id).subscribe({
      next: () => {
        this.procesandoPareja = false;
        this.mensajePareja = 'Ahora ya estan conectados como pareja.';
        this.cargarEstadoPareja();
      },
      error: (error) => {
        this.procesandoPareja = false;
        this.errorPareja = error?.error?.message || 'No se pudo aceptar la invitacion.';
      }
    });
  }

  rechazarInvitacion(): void {
    if (!this.invitacionPendienteRecibida || this.procesandoPareja) {
      return;
    }

    this.procesandoPareja = true;
    this.errorPareja = '';

    this.parejaService.rejectInvitation(this.invitacionPendienteRecibida.id).subscribe({
      next: () => {
        this.procesandoPareja = false;
        this.mensajePareja = 'Invitacion rechazada.';
        this.cargarEstadoPareja();
      },
      error: (error) => {
        this.procesandoPareja = false;
        this.errorPareja = error?.error?.message || 'No se pudo rechazar la invitacion.';
      }
    });
  }

  private cargarEstadoPareja(): void {
    const usuario = this.usuarioActual;
    if (!usuario) {
      return;
    }

    this.cargandoPareja = true;
    this.parejaActiva = null;
    this.invitacionPendienteRecibida = null;
    this.invitacionPendienteEnviada = null;
    this.estados = [];
    this.mostrarSelectorEmoji = [];

    this.parejaService.getMyPairs().subscribe({
      next: (parejas: ParejaResponse[]) => {
        this.cargandoPareja = false;
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
        this.invitacionPendienteRecibida = parejas.find(
          (pareja) => pareja.estado === 'PENDIENTE' && pareja.usuarioDosId === usuario.id
        ) ?? null;
        this.invitacionPendienteEnviada = parejas.find(
          (pareja) => pareja.estado === 'PENDIENTE' && pareja.usuarioUnoId === usuario.id
        ) ?? null;

        if (this.parejaActiva) {
          this.cargarEstadosEmocionales();
        }

        this.actualizarRespuestasInicio(this.respuestasPreguntaInicio);
        if (this.parejaActiva && this.preguntaInicio) {
          this.refrescarRespuestasInicio();
        }
      },
      error: (error) => {
        this.cargandoPareja = false;
        this.errorPareja = error?.error?.message || 'No se pudo cargar el estado de pareja.';
      }
    });
  }

  mostrarCaja(): void {
    if (!this.preguntaInicio) {
      return;
    }

    this.mostrarInput = true;
  }

  ocultarCaja(): void {
    this.mostrarInput = false;
    this.successPreguntaInicio = '';
  }

  enviarRespuesta(): void {
    if (!this.preguntaInicio || !this.respuesta.trim() || this.guardandoPreguntaInicio) {
      return;
    }

    this.guardandoPreguntaInicio = true;
    this.errorPreguntaInicio = '';
    this.successPreguntaInicio = '';
    const isUpdating = this.respuestaInicioId !== null;

    const payload = {
      contenido: this.respuesta.trim()
    };

    const request$ = this.respuestaInicioId
      ? this.respuestaService.updateRespuesta(this.respuestaInicioId, payload)
      : this.respuestaService.createRespuesta(this.preguntaInicio.id, payload);

    request$.subscribe({
      next: (respuestaGuardada) => {
        this.guardandoPreguntaInicio = false;
        this.respuestaInicioId = respuestaGuardada.id;
        this.respuesta = respuestaGuardada.contenido;
        this.successPreguntaInicio = isUpdating
          ? 'Respuesta actualizada correctamente.'
          : 'Respuesta enviada correctamente.';
        this.mostrarInput = false;
        if (this.preguntaInicio) {
          this.cargarRespuestaInicioGuardada(this.preguntaInicio.id);
        }
      },
      error: (error) => {
        this.guardandoPreguntaInicio = false;
        this.errorPreguntaInicio = 'No se pudo guardar la respuesta.';
        console.error('Error saving inicio respuesta:', error);
      }
    });
  }

  private cargarPreguntaInicio(): void {
    this.cargandoPreguntaInicio = true;
    this.errorPreguntaInicio = '';
    this.resetPreguntaInicio(false);

    this.temaService.getAllTemas().subscribe({
      next: (temas) => {
        if (temas.length === 0) {
          this.cargandoPreguntaInicio = false;
          this.errorPreguntaInicio = 'Todavia no hay temas cargados.';
          return;
        }

        this.cargarSubtemaGlobal(temas);
      },
      error: (error) => {
        this.cargandoPreguntaInicio = false;
        this.errorPreguntaInicio = 'No se pudo cargar la pregunta de inicio.';
        console.error('Error loading temas inicio:', error);
      }
    });
  }

  private cargarSubtemaGlobal(temas: TemaResponse[]): void {
    forkJoin(temas.map((tema) => this.subtemaService.getAllByTema(tema.id))).subscribe({
      next: (subtemasPorTema) => {
        const subtemaTarjeta = subtemasPorTema
          .flat()
          .find((subtema) => subtema.descripcion?.trim() === this.subtemaTarjetaDescripcion) ?? null;

        if (!subtemaTarjeta) {
          this.cargandoPreguntaInicio = false;
          this.errorPreguntaInicio = `No se encontro un subtema con descripcion "${this.subtemaTarjetaDescripcion}".`;
          return;
        }

        this.cargarPreguntaDesdeSubtema(subtemaTarjeta);
      },
      error: (error) => {
        this.cargandoPreguntaInicio = false;
        this.errorPreguntaInicio = 'No se pudo cargar el subtema de inicio.';
        console.error('Error loading subtemas inicio:', error);
      }
    });
  }

  private cargarPreguntaDesdeSubtema(subtema: SubtemaResponse): void {
    this.preguntaService.getAllBySubtema(subtema.id).subscribe({
      next: (preguntas) => {
        const pregunta = this.seleccionarPreguntaDelDia(preguntas);

        if (!pregunta) {
          this.cargandoPreguntaInicio = false;
          this.errorPreguntaInicio = 'Ese subtema todavia no tiene preguntas.';
          return;
        }

        this.preguntaInicio = pregunta;
        this.cargarRespuestaInicioGuardada(pregunta.id);
      },
      error: (error) => {
        this.cargandoPreguntaInicio = false;
        this.errorPreguntaInicio = 'No se pudo cargar la pregunta del inicio.';
        console.error('Error loading pregunta inicio:', error);
      }
    });
  }

  private seleccionarPreguntaDelDia(preguntas: PreguntaResponse[]): PreguntaResponse | null {
    if (preguntas.length === 0) {
      return null;
    }

    const hoy = new Date();
    const claveDia = Number(
      `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`
    );
    const indice = claveDia % preguntas.length;
    return preguntas[indice] ?? preguntas[0] ?? null;
  }

  private iniciarCuentaRegresivaPregunta(): void {
    this.actualizarTiempoRestantePregunta();

    if (this.cuentaRegresivaIntervalId) {
      clearInterval(this.cuentaRegresivaIntervalId);
    }

    this.cuentaRegresivaIntervalId = setInterval(() => {
      this.actualizarTiempoRestantePregunta();
    }, 1000);
  }

  private actualizarTiempoRestantePregunta(): void {
    const ahora = new Date();
    const siguienteDia = new Date(ahora);
    siguienteDia.setHours(24, 0, 0, 0);

    const diferencia = siguienteDia.getTime() - ahora.getTime();
    const totalSegundos = Math.max(0, Math.floor(diferencia / 1000));
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    this.tiempoRestantePregunta = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    if (!this.mostrarInput && this.preguntaInicio && this.tieneParejaActiva && Date.now() - this.lastRespuestasRefresh > 10000) {
      this.refrescarRespuestasInicio();
    }

    if (totalSegundos === 0) {
      this.cargarPreguntaInicio();
    }
  }

  private cargarRespuestaInicioGuardada(preguntaId: number): void {
    const user = this.usuarioActual;

    if (!user) {
      this.cargandoPreguntaInicio = false;
      return;
    }

    this.respuestaService.getRespuestasByPregunta(preguntaId).subscribe({
      next: (respuestas) => {
        const respuestaGuardada = respuestas.find((respuesta) => respuesta.usuarioId === user.id) ?? null;
        this.respuestaInicioId = respuestaGuardada?.id ?? null;
        this.respuesta = respuestaGuardada?.contenido ?? '';
        this.actualizarRespuestasInicio(respuestas);
        this.lastRespuestasRefresh = Date.now();
        this.cargandoPreguntaInicio = false;
      },
      error: (error) => {
        this.respuestaInicioId = null;
        this.respuesta = '';
        this.actualizarRespuestasInicio([]);
        this.lastRespuestasRefresh = Date.now();
        this.cargandoPreguntaInicio = false;
        console.warn('No se pudo recuperar una respuesta previa en inicio. Se deja vacio.', error);
      }
    });
  }

  obtenerDistancia(): void {
    navigator.geolocation.getCurrentPosition((pos) => {
      const latUsuario = pos.coords.latitude;
      const lonUsuario = pos.coords.longitude;

      const latThalia = -12.0464;
      const lonThalia = -77.0428;

      this.distanciaKm = this.calcularDistancia(
        latUsuario,
        lonUsuario,
        latThalia,
        lonThalia
      );
    });
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const r = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return r * c;
  }

  deg2rad(grados: number): number {
    return grados * (Math.PI / 180);
  }

  irAMiPerfil(): void {
    this.router.navigate(['/mi-perfil']);
  }

  abrirLlave(): void {
    if (this.abriendoLlave) {
      return;
    }

    this.abriendoLlave = true;

    setTimeout(() => {
      this.mostrarMensaje = true;
    }, 900);
  }

  guardarMensaje(): void {
    localStorage.setItem('mensajeRefugio', this.mensajeRefugio);
    this.editando = false;
  }

  toggleEmojiSelector(index: number): void {
    const usuarioActual = this.usuarioActual;
    if (!usuarioActual || this.estados[index]?.usuarioId !== usuarioActual.id) {
      return;
    }

    this.mostrarSelectorEmoji[index] = !this.mostrarSelectorEmoji[index];
  }

  seleccionarEmoji(index: number, emoji: string): void {
    const estado = this.emojiEstadoMap[emoji] || 'Neutral';
    const usuarioActual = this.usuarioActual;
    const estadoSeleccionado = this.estados[index];

    if (!usuarioActual || !estadoSeleccionado || estadoSeleccionado.usuarioId !== usuarioActual.id) {
      this.mostrarSelectorEmoji[index] = false;
      return;
    }

    this.errorEstadoEmocional = '';

    this.estadoEmocionalService.updateMiEstado({ emoji, estado }).subscribe({
      next: (estadoActualizado) => {
        this.estados = this.estados.map((item) =>
          item.usuarioId === estadoActualizado.usuarioId
            ? this.mapEstadoEmocional(estadoActualizado)
            : item
        );
        this.mostrarSelectorEmoji[index] = false;
      },
      error: (error) => {
        this.errorEstadoEmocional = 'No se pudo guardar el estado emocional.';
        this.mostrarSelectorEmoji[index] = false;
        console.error('Error updating estado emocional:', error);
      }
    });
  }

  private cargarEstadosEmocionales(): void {
    this.estadoEmocionalService.getEstadosDeMiPareja().subscribe({
      next: (estados) => {
        this.estados = estados.map((estado) => this.mapEstadoEmocional(estado));
        this.mostrarSelectorEmoji = this.estados.map(() => false);
      },
      error: (error) => {
        this.errorEstadoEmocional = 'No se pudo cargar el mapa emocional.';
        console.error('Error loading estados emocionales:', error);
      }
    });
  }

  private mapEstadoEmocional(estado: EstadoEmocionalResponse): EstadoUi {
    return {
      usuarioId: estado.usuarioId,
      usuario: estado.usuarioNombre,
      estado: estado.estado || 'Sin definir',
      emoji: estado.emoji || '🙂'
    };
  }

  private resetPreguntaInicio(limpiarError: boolean = true): void {
    this.preguntaInicio = null;
    this.respuestaInicioId = null;
    this.respuesta = '';
    this.respuestasPreguntaInicio = [];
    this.respuestaUsuarioActual = null;
    this.respuestaPareja = null;
    this.mostrarResultados = false;
    this.lastRespuestasRefresh = 0;
    this.mostrarInput = false;
    if (limpiarError) {
      this.errorPreguntaInicio = '';
    }
    this.successPreguntaInicio = '';
  }

  private actualizarRespuestasInicio(respuestas: RespuestaResponse[]): void {
    this.respuestasPreguntaInicio = respuestas;
    this.respuestaUsuarioActual = null;
    this.respuestaPareja = null;

    const usuario = this.usuarioActual;
    if (!usuario || !this.tieneParejaActiva || !this.parejaActiva) {
      return;
    }

    const idPareja = usuario.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosId
      : this.parejaActiva.usuarioUnoId;

    this.respuestaUsuarioActual = respuestas.find((respuesta) => respuesta.usuarioId === usuario.id) ?? null;
    this.respuestaPareja = respuestas.find((respuesta) => respuesta.usuarioId === idPareja) ?? null;
  }

  private refrescarRespuestasInicio(): void {
    if (!this.preguntaInicio || !this.usuarioActual) {
      return;
    }
    this.respuestaService.getRespuestasByPregunta(this.preguntaInicio.id).subscribe({
      next: (respuestas) => {
        const respuestaGuardada = respuestas.find((respuesta) => respuesta.usuarioId === this.usuarioActual?.id) ?? null;
        this.respuestaInicioId = respuestaGuardada?.id ?? null;
        this.respuesta = respuestaGuardada?.contenido ?? '';
        this.actualizarRespuestasInicio(respuestas);
        this.lastRespuestasRefresh = Date.now();
      },
      error: () => {
        this.lastRespuestasRefresh = Date.now();
      }
    });
  }
}
