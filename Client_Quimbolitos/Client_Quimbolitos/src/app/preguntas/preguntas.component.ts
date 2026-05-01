import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../service/auth.service';
import { ApiService } from '../service/api.service';
import { PreguntaResponse, PreguntaService, UpdatePreguntaRequest } from '../service/pregunta.service';
import { RespuestaResponse, RespuestaService } from '../service/respuesta.service';
import { ParejaResponse, ParejaService } from '../service/pareja.service';
import { CreateSubtemaRequest, SubtemaResponse, SubtemaService, UpdateSubtemaRequest } from '../service/subtema.service';
import { CreateTemaRequest, TemaResponse, TemaService, UpdateTemaRequest } from '../service/tema.service';
import { UsuarioService } from '../service/usuario.service';
import { VisualPreguntaResponse, VisualPreguntaService } from '../service/visual-pregunta.service';

@Component({
  selector: 'app-preguntas',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.css']
})
export class PreguntasComponent implements OnInit, OnDestroy {
  temas: TemaResponse[] = [];
  subtemas: SubtemaResponse[] = [];
  preguntas: PreguntaResponse[] = [];
  preguntasRespondidas = new Set<number>();
  parejaActiva: ParejaResponse | null = null;
  respuestasSubtema: RespuestaSubtema[] = [];
  visualConfigPorPregunta = new Map<number, VisualPreguntaResponse>();
  mostrarResultadosSubtema = false;
  indiceResultado = 0;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  temaSeleccionadoId: number | null = null;
  subtemaSeleccionadoId: number | null = null;

  isLoadingTemas = false;
  isLoadingSubtemas = false;
  isLoadingPreguntas = false;

  errorMessage = '';
  adminActionMessage = '';
  isSavingAdminAction = false;
  adminAccessConfirmed = false;
  activandoAdminBootstrap = false;
  modalEdicionAbierto = false;
  modalEdicionModo: ModalMode = 'editar';
  modalEdicionTipo: EditableEntityType | null = null;
  modalTitulo = '';
  formularioEdicion: EditFormState = this.crearFormularioVacio();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private temaService: TemaService,
    private subtemaService: SubtemaService,
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService,
    private parejaService: ParejaService,
    private usuarioService: UsuarioService,
    private visualPreguntaService: VisualPreguntaService
  ) {}

  ngOnInit(): void {
    this.sincronizarPermisosAdmin();
    this.cargarParejaActiva();
    this.cargarTemas();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  cargarTemas(): void {
    this.isLoadingTemas = true;
    this.errorMessage = '';

    this.temaService.getAllTemas().subscribe({
      next: (temas) => {
        this.temas = temas;
        this.isLoadingTemas = false;

        if (temas.length === 0) {
          this.temaSeleccionadoId = null;
          this.subtemaSeleccionadoId = null;
          this.subtemas = [];
          this.preguntas = [];
          return;
        }

        const temaActual = temas.find((tema) => tema.id === this.temaSeleccionadoId);
        this.seleccionarTema(temaActual ? temaActual.id : temas[0].id);
      },
      error: (error) => {
        this.isLoadingTemas = false;
        this.errorMessage = 'No se pudieron cargar los temas.';
        console.error('Error loading temas:', error);
      }
    });
  }

  seleccionarTema(temaId: number): void {
    this.temaSeleccionadoId = temaId;
    this.subtemaSeleccionadoId = null;
    this.preguntas = [];
    this.cargarSubtemas(temaId);
  }

  cargarSubtemas(temaId: number): void {
    this.isLoadingSubtemas = true;

    this.subtemaService.getAllByTema(temaId).subscribe({
      next: (subtemas) => {
        this.subtemas = subtemas;
        this.isLoadingSubtemas = false;

        if (subtemas.length === 0) {
          this.subtemaSeleccionadoId = null;
          this.preguntas = [];
          return;
        }

        const subtemaActual = subtemas.find((subtema) => subtema.id === this.subtemaSeleccionadoId);
        this.seleccionarSubtema(subtemaActual ? subtemaActual.id : subtemas[0].id);
      },
      error: (error) => {
        this.isLoadingSubtemas = false;
        this.errorMessage = 'No se pudieron cargar los subtemas.';
        console.error('Error loading subtemas:', error);
      }
    });
  }

  seleccionarSubtema(subtemaId: number): void {
    this.subtemaSeleccionadoId = subtemaId;
    this.cargarPreguntas(subtemaId);
  }

  getIconoPath(icono?: string | null): string | null {
    if (!icono) {
      return null;
    }

    const normalizedIcon = icono.trim().replace(/^[/\\]+/, '');
    return normalizedIcon ? `assets/${normalizedIcon}` : null;
  }

  ocultarIconoRoto(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image) {
      image.style.display = 'none';
    }
  }

  cargarPreguntas(subtemaId: number): void {
    this.isLoadingPreguntas = true;
    this.preguntasRespondidas.clear();
    this.respuestasSubtema = [];
    this.visualConfigPorPregunta.clear();
    this.mostrarResultadosSubtema = false;
    this.indiceResultado = 0;

    this.preguntaService.getAllBySubtema(subtemaId).subscribe({
      next: (preguntas) => {
        this.preguntas = preguntas;
        this.cargarEstadoRespuestas(preguntas);
        this.cargarRespuestasSubtema(preguntas);
      },
      error: (error) => {
        this.isLoadingPreguntas = false;
        this.errorMessage = 'No se pudieron cargar las preguntas.';
        console.error('Error loading preguntas:', error);
      }
    });
  }

  estaCompletada(preguntaId: number): boolean {
    return this.preguntasRespondidas.has(preguntaId);
  }

  getEstadoRespuestaPregunta(preguntaId: number): { usuario: boolean; pareja: boolean } {
    const item = this.respuestasSubtema.find((respuesta) => respuesta.pregunta.id === preguntaId);
    return {
      usuario: !!item?.respuestaUsuario,
      pareja: !!item?.respuestaPareja
    };
  }

  get puedeVerResultadosSubtema(): boolean {
    return this.respuestasSubtema.length > 0 && this.respuestasSubtema.every((item) => item.respuestaUsuario && item.respuestaPareja);
  }

  get estadoResultadosSubtema(): string | null {
    if (!this.parejaActiva || this.parejaActiva.estado !== 'ACTIVA') {
      return null;
    }

    if (this.respuestasSubtema.length === 0) {
      return null;
    }

    const completas = this.respuestasSubtema.filter((item) => item.respuestaUsuario && item.respuestaPareja).length;
    if (completas === this.respuestasSubtema.length) {
      return 'Subtema completo. Puedes ver resultados.';
    }

    return `Respuestas completas: ${completas}/${this.respuestasSubtema.length}`;
  }

  abrirResultadosSubtema(): void {
    if (!this.puedeVerResultadosSubtema) {
      return;
    }
    this.indiceResultado = 0;
    this.mostrarResultadosSubtema = true;
  }

  cerrarResultadosSubtema(): void {
    this.mostrarResultadosSubtema = false;
  }

  siguienteResultado(): void {
    if (!this.respuestasSubtema.length) {
      return;
    }
    this.indiceResultado = (this.indiceResultado + 1) % this.respuestasSubtema.length;
  }

  anteriorResultado(): void {
    if (!this.respuestasSubtema.length) {
      return;
    }
    this.indiceResultado = (this.indiceResultado - 1 + this.respuestasSubtema.length) % this.respuestasSubtema.length;
  }

  get resultadoActual(): RespuestaSubtema | null {
    if (!this.respuestasSubtema.length) {
      return null;
    }
    return this.respuestasSubtema[this.indiceResultado] ?? null;
  }

  get subtemaActual(): SubtemaResponse | null {
    if (!this.subtemaSeleccionadoId) {
      return null;
    }
    return this.subtemas.find((subtema) => subtema.id === this.subtemaSeleccionadoId) ?? null;
  }

  get esSubtemaVisual(): boolean {
    return this.itemsVisuales.length > 0;
  }

  get esTemaQuienEsMasProbable(): boolean {
    const temaNombre = this.temaActual?.nombre
      ?? this.resultadoActual?.pregunta?.temaNombre
      ?? this.respuestasSubtema[0]?.pregunta?.temaNombre
      ?? '';
    return this.normalizarNombreTema(temaNombre) === 'quien es mas probable';
  }

  get temaActual(): TemaResponse | null {
    if (!this.temaSeleccionadoId) {
      return null;
    }
    return this.temas.find((tema) => tema.id === this.temaSeleccionadoId) ?? null;
  }

  get esAdmin(): boolean {
    return this.adminAccessConfirmed;
  }

  get puedeCrearSubtema(): boolean {
    return this.temaSeleccionadoId !== null;
  }

  get modalDescripcion(): string {
    if (this.modalEdicionModo === 'crear') {
      if (this.modalEdicionTipo === 'tema') {
        return 'Crea un nuevo tema para empezar a organizar subtemas y preguntas.';
      }
      if (this.modalEdicionTipo === 'subtema') {
        return 'Agrega un subtema nuevo dentro del tema seleccionado.';
      }
    }
    return 'Actualiza el contenido sin perder la coherencia visual con el resto del tablero.';
  }

  get textoBotonGuardar(): string {
    if (this.isSavingAdminAction) {
      return this.modalEdicionModo === 'crear' ? 'Creando...' : 'Guardando...';
    }
    return this.modalEdicionModo === 'crear' ? 'Crear' : 'Guardar cambios';
  }

  abrirModalCrearTema(): void {
    this.errorMessage = '';
    this.modalEdicionModo = 'crear';
    this.modalEdicionTipo = 'tema';
    this.modalTitulo = 'Crear tema';
    this.formularioEdicion = this.crearFormularioVacio();
    this.adminActionMessage = '';
    this.modalEdicionAbierto = true;
  }

  abrirModalCrearSubtema(): void {
    if (!this.temaSeleccionadoId) {
      this.errorMessage = 'Selecciona un tema antes de crear un subtema.';
      return;
    }

    this.errorMessage = '';
    this.modalEdicionModo = 'crear';
    this.modalEdicionTipo = 'subtema';
    this.modalTitulo = 'Crear subtema';
    this.formularioEdicion = this.crearFormularioVacio();
    this.adminActionMessage = '';
    this.modalEdicionAbierto = true;
  }

  abrirModalTema(tema: TemaResponse, event?: Event): void {
    event?.stopPropagation();
    this.modalEdicionModo = 'editar';
    this.modalEdicionTipo = 'tema';
    this.modalTitulo = 'Editar tema';
    this.formularioEdicion = {
      id: tema.id,
      nombre: tema.nombre ?? '',
      descripcion: tema.descripcion ?? '',
      icono: '',
      activa: true
    };
    this.adminActionMessage = '';
    this.modalEdicionAbierto = true;
  }

  abrirModalSubtema(subtema: SubtemaResponse, event?: Event): void {
    event?.stopPropagation();
    this.modalEdicionModo = 'editar';
    this.modalEdicionTipo = 'subtema';
    this.modalTitulo = 'Editar subtema';
    this.formularioEdicion = {
      id: subtema.id,
      nombre: subtema.nombre ?? '',
      descripcion: subtema.descripcion ?? '',
      icono: subtema.icono ?? '',
      activa: true
    };
    this.adminActionMessage = '';
    this.modalEdicionAbierto = true;
  }

  abrirModalPregunta(pregunta: PreguntaResponse, event?: Event): void {
    event?.stopPropagation();
    this.modalEdicionModo = 'editar';
    this.modalEdicionTipo = 'pregunta';
    this.modalTitulo = 'Editar pregunta';
    this.formularioEdicion = {
      id: pregunta.id,
      nombre: pregunta.enunciado ?? '',
      descripcion: pregunta.descripcion ?? '',
      icono: '',
      activa: pregunta.activa
    };
    this.adminActionMessage = '';
    this.modalEdicionAbierto = true;
  }

  cerrarModalEdicion(): void {
    if (this.isSavingAdminAction) {
      return;
    }
    this.modalEdicionAbierto = false;
    this.modalEdicionModo = 'editar';
    this.modalEdicionTipo = null;
    this.modalTitulo = '';
    this.formularioEdicion = this.crearFormularioVacio();
  }

  guardarEdicion(): void {
    if (!this.modalEdicionTipo) {
      return;
    }

    const nombre = this.formularioEdicion.nombre.trim();
    if (!nombre) {
      this.adminActionMessage = 'El nombre o enunciado no puede estar vacio.';
      return;
    }

    this.isSavingAdminAction = true;
    this.adminActionMessage = '';

    if (this.modalEdicionModo === 'crear') {
      this.guardarCreacion(nombre);
      return;
    }

    if (!this.formularioEdicion.id) {
      this.isSavingAdminAction = false;
      return;
    }

    if (this.modalEdicionTipo === 'tema') {
      const payload: UpdateTemaRequest = {
        nombre,
        descripcion: this.valorOpcional(this.formularioEdicion.descripcion)
      };
      this.ejecutarAccionAdmin(
        () => this.temaService.updateTema(this.formularioEdicion.id!, payload),
        () => {
          this.isSavingAdminAction = false;
          this.cerrarModalEdicion();
          this.cargarTemas();
        },
        'No se pudo editar el tema.'
      );
      return;
    }

    if (this.modalEdicionTipo === 'subtema') {
      const payload: UpdateSubtemaRequest = {
        nombre,
        descripcion: this.valorOpcional(this.formularioEdicion.descripcion),
        icono: this.valorOpcional(this.formularioEdicion.icono)
      };
      this.ejecutarAccionAdmin(
        () => this.subtemaService.updateSubtema(this.formularioEdicion.id!, payload),
        () => {
          this.isSavingAdminAction = false;
          this.cerrarModalEdicion();
          if (this.temaSeleccionadoId) {
            this.cargarSubtemas(this.temaSeleccionadoId);
          }
        },
        'No se pudo editar el subtema.'
      );
      return;
    }

    const payload: UpdatePreguntaRequest = {
      enunciado: nombre,
      descripcion: this.valorOpcional(this.formularioEdicion.descripcion),
      activa: this.formularioEdicion.activa
    };
    this.ejecutarAccionAdmin(
      () => this.preguntaService.updatePregunta(this.formularioEdicion.id!, payload),
      () => {
        this.isSavingAdminAction = false;
        this.cerrarModalEdicion();
        if (this.subtemaSeleccionadoId) {
          this.cargarPreguntas(this.subtemaSeleccionadoId);
        }
      },
      'No se pudo editar la pregunta.'
    );
  }

  private guardarCreacion(nombre: string): void {
    if (this.modalEdicionTipo === 'tema') {
      const payload: CreateTemaRequest = {
        nombre,
        descripcion: this.valorOpcional(this.formularioEdicion.descripcion)
      };

      this.ejecutarAccionAdmin(
        () => this.temaService.createTema(payload),
        (temaCreado) => {
          this.isSavingAdminAction = false;
          this.cerrarModalEdicion();
          this.temaSeleccionadoId = temaCreado.id;
          this.cargarTemas();
        },
        'No se pudo crear el tema.'
      );
      return;
    }

    if (this.modalEdicionTipo === 'subtema' && this.temaSeleccionadoId) {
      const payload: CreateSubtemaRequest = {
        nombre,
        descripcion: this.valorOpcional(this.formularioEdicion.descripcion),
        icono: this.valorOpcional(this.formularioEdicion.icono)
      };

      this.ejecutarAccionAdmin(
        () => this.subtemaService.createSubtema(this.temaSeleccionadoId!, payload),
        (subtemaCreado) => {
          this.isSavingAdminAction = false;
          this.cerrarModalEdicion();
          this.subtemaSeleccionadoId = subtemaCreado.id;
          this.cargarSubtemas(this.temaSeleccionadoId!);
        },
        'No se pudo crear el subtema.'
      );
      return;
    }

    this.isSavingAdminAction = false;
    this.adminActionMessage = 'No se pudo determinar que elemento quieres crear.';
  }

  eliminarTema(tema: TemaResponse, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`Vas a eliminar el tema "${tema.nombre}".`)) {
      return;
    }

    this.adminActionMessage = '';
    this.ejecutarAccionAdmin(
      () => this.temaService.deleteTema(tema.id),
      () => this.cargarTemas(),
      'No se pudo eliminar el tema.'
    );
  }

  eliminarSubtema(subtema: SubtemaResponse, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`Vas a eliminar el subtema "${subtema.nombre}".`)) {
      return;
    }

    this.adminActionMessage = '';
    this.ejecutarAccionAdmin(
      () => this.subtemaService.deleteSubtema(subtema.id),
      () => {
        if (this.temaSeleccionadoId) {
          this.cargarSubtemas(this.temaSeleccionadoId);
        }
      },
      'No se pudo eliminar el subtema.'
    );
  }

  eliminarPregunta(pregunta: PreguntaResponse, event?: Event): void {
    event?.stopPropagation();
    if (!confirm('Vas a eliminar esta pregunta.')) {
      return;
    }

    this.adminActionMessage = '';
    this.ejecutarAccionAdmin(
      () => this.preguntaService.deletePregunta(pregunta.id),
      () => {
        if (this.subtemaSeleccionadoId) {
          this.cargarPreguntas(this.subtemaSeleccionadoId);
        }
      },
      'No se pudo eliminar la pregunta.'
    );
  }

  get porcentajeCoincidencia(): number {
    const completas = this.respuestasComparables;
    if (completas.length === 0) {
      return 0;
    }
    const coincidencias = completas.filter((item) =>
      this.normalizarRespuesta(item.respuestaUsuario?.contenido) ===
      this.normalizarRespuesta(item.respuestaPareja?.contenido)
    ).length;
    return Math.round((coincidencias / completas.length) * 100);
  }

  get itemsProbabilidad(): ProbabilidadResultadoItem[] {
    return this.respuestasComparables.map((respuesta, index) => ({
      respuesta,
      index,
      coincidencia:
        this.normalizarRespuesta(respuesta.respuestaUsuario?.contenido) ===
        this.normalizarRespuesta(respuesta.respuestaPareja?.contenido)
    }));
  }

  opcionSeleccionada(item: RespuestaSubtema, opcionId: string, tipo: 'usuario' | 'pareja'): boolean {
    const respuesta = tipo === 'usuario' ? item.respuestaUsuario?.contenido : item.respuestaPareja?.contenido;
    return this.normalizarRespuesta(respuesta) === this.normalizarRespuesta(opcionId);
  }

  get itemsVisuales(): VisualResultadoItem[] {
    return this.respuestasSubtema
      .map((respuesta, index) => ({
        respuesta,
        index,
        opciones: this.convertirOpciones(this.visualConfigPorPregunta.get(respuesta.pregunta.id))
      }))
      .filter((item) => item.opciones.length > 0);
  }

  private normalizarRespuesta(valor?: string | null): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private get respuestasComparables(): RespuestaSubtema[] {
    return this.respuestasSubtema
      .filter((item) => item.respuestaUsuario && item.respuestaPareja);
  }

  resolverEtiquetaProbabilidad(valor?: string | null): string {
    const respuesta = this.normalizarRespuesta(valor);
    if (!this.parejaActiva) {
      if (respuesta === 'ambos') {
        return 'Ambos';
      }
      if (respuesta === 'ninguno') {
        return 'Ninguno';
      }
      if (respuesta === 'usuario_uno') {
        return 'Usuario 1';
      }
      if (respuesta === 'usuario_dos') {
        return 'Usuario 2';
      }
      return valor?.trim() || 'Sin respuesta';
    }

    switch (respuesta) {
      case 'usuario_uno':
        return this.parejaActiva.usuarioUnoNombre;
      case 'usuario_dos':
        return this.parejaActiva.usuarioDosNombre;
      case 'ambos':
        return 'Ambos';
      case 'ninguno':
        return 'Ninguno';
      default:
        return valor?.trim() || 'Sin respuesta';
    }
  }

  private normalizarNombreTema(valor?: string | null): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private cargarVisualConfigs(subtemaId: number): void {
    this.visualPreguntaService.getBySubtemaId(subtemaId).subscribe({
      next: (configs) => {
        this.visualConfigPorPregunta = new Map(configs.map((config) => [config.preguntaId, config]));
      },
      error: () => {
        this.visualConfigPorPregunta.clear();
      }
    });
  }

  private convertirOpciones(config?: VisualPreguntaResponse): VisualOption[] {
    if (!config) {
      return [];
    }
    return [
      {
        id: 'A',
        label: config.opcionALabel?.trim() || 'Opcion A',
        src: this.normalizarSrc(config.opcionASrc),
        alt: config.opcionAAlt?.trim() || 'Opcion A'
      },
      {
        id: 'B',
        label: config.opcionBLabel?.trim() || 'Opcion B',
        src: this.normalizarSrc(config.opcionBSrc),
        alt: config.opcionBAlt?.trim() || 'Opcion B'
      }
    ].filter((opcion) => opcion.src);
  }

  private normalizarSrc(src?: string | null): string {
    const trimmed = src?.trim() ?? '';
    if (!trimmed) {
      return '';
    }
    return this.apiService.getAssetUrl(trimmed);
  }

  private cargarEstadoRespuestas(preguntas: PreguntaResponse[]): void {
    const user = this.authService.getUser();

    if (!user || preguntas.length === 0) {
      this.isLoadingPreguntas = false;
      return;
    }

    forkJoin(
      preguntas.map((pregunta) =>
        this.respuestaService.getRespuestasByPregunta(pregunta.id).pipe(
          map((respuestas) => ({
            preguntaId: pregunta.id,
            respondida: respuestas.some((respuesta) => respuesta.usuarioId === user.id)
          })),
          catchError(() => of({ preguntaId: pregunta.id, respondida: false }))
        )
      )
    ).subscribe({
      next: (estados) => {
        this.preguntasRespondidas = new Set(
          estados.filter((estado) => estado.respondida).map((estado) => estado.preguntaId)
        );
        this.isLoadingPreguntas = false;
      },
      error: () => {
        this.isLoadingPreguntas = false;
      }
    });
  }

  private cargarParejaActiva(): void {
    const user = this.authService.getUser();
    if (!user) {
      return;
    }

    this.parejaService.getMyPairs().subscribe({
      next: (parejas) => {
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
        if (this.preguntas.length > 0) {
          this.cargarRespuestasSubtema(this.preguntas);
        }
      },
      error: () => {
        this.parejaActiva = null;
      }
    });
  }

  private cargarRespuestasSubtema(preguntas: PreguntaResponse[]): void {
    const user = this.authService.getUser();
    if (!user || preguntas.length === 0 || !this.parejaActiva || this.parejaActiva.estado !== 'ACTIVA') {
      this.respuestasSubtema = [];
      return;
    }

    const parejaId = user.id === this.parejaActiva.usuarioUnoId
      ? this.parejaActiva.usuarioDosId
      : this.parejaActiva.usuarioUnoId;

    forkJoin(
      preguntas.map((pregunta) =>
        this.respuestaService.getRespuestasByPregunta(pregunta.id).pipe(
          map((respuestas) => ({
            pregunta,
            respuestaUsuario: respuestas.find((respuesta) => respuesta.usuarioId === user.id) ?? null,
            respuestaPareja: respuestas.find((respuesta) => respuesta.usuarioId === parejaId) ?? null
          })),
          catchError(() => of({
            pregunta,
            respuestaUsuario: null,
            respuestaPareja: null
          }))
        )
      )
    ).subscribe({
      next: (resultados) => {
        this.respuestasSubtema = resultados;
        this.preguntasRespondidas = new Set(
          resultados.filter((item) => item.respuestaUsuario).map((item) => item.pregunta.id)
        );
        if (this.subtemaSeleccionadoId) {
          this.cargarVisualConfigs(this.subtemaSeleccionadoId);
        }
      },
      error: () => {
        this.respuestasSubtema = [];
        this.visualConfigPorPregunta.clear();
      }
    });
  }

  private iniciarAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    this.refreshIntervalId = setInterval(() => {
      if (!this.subtemaSeleccionadoId || this.preguntas.length === 0) {
        return;
      }
      if (!this.parejaActiva || this.parejaActiva.estado !== 'ACTIVA') {
        return;
      }
      this.cargarRespuestasSubtema(this.preguntas);
    }, 15000);
  }

  private crearFormularioVacio(): EditFormState {
    return {
      id: null,
      nombre: '',
      descripcion: '',
      icono: '',
      activa: true
    };
  }

  private valorOpcional(valor: string): string | undefined {
    const limpio = valor.trim();
    return limpio ? limpio : undefined;
  }

  private sincronizarPermisosAdmin(): void {
    if (!this.authService.isLoggedIn()) {
      this.adminAccessConfirmed = false;
      return;
    }

    this.authService.refreshCurrentUser().subscribe({
      next: (user) => {
        this.adminAccessConfirmed = user.rol === 'ADMIN';
      },
      error: () => {
        this.adminAccessConfirmed = false;
      }
    });
  }

  private manejarErrorAdmin(message: string, error: unknown): void {
    this.isSavingAdminAction = false;
    const httpError = error as { status?: number; error?: { message?: string; errors?: Record<string, string> } } | null;
    this.adminActionMessage = this.extraerMensajeErrorHttp(httpError, message);
    console.error(message, error);
  }

  private manejarErrorVista(message: string, error: unknown): void {
    this.errorMessage = message;
    console.error(message, error);
  }

  private extraerMensajeErrorHttp(
    error: { error?: { message?: string; errors?: Record<string, string> } } | null,
    fallback: string
  ): string {
    const validationErrors = error?.error?.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors).find((value) => !!value?.trim());
      if (firstError) {
        return firstError;
      }
    }

    const message = error?.error?.message?.trim();
    return message || fallback;
  }

  private ejecutarAccionAdmin<T>(
    requestFactory: () => Observable<T>,
    onSuccess: (resultado: T) => void,
    errorMessage: string
  ): void {
    requestFactory().subscribe({
      next: (resultado) => onSuccess(resultado),
      error: (error) => {
        const httpError = error as { status?: number } | null;
        if (httpError?.status === 403) {
          this.intentarActivarAdminBootstrapYReintentar(requestFactory, onSuccess, errorMessage);
          return;
        }
        this.manejarErrorAdmin(errorMessage, error);
      }
    });
  }

  private intentarActivarAdminBootstrapYReintentar<T>(
    requestFactory: () => Observable<T>,
    onSuccess: (resultado: T) => void,
    errorMessage: string
  ): void {
    if (this.activandoAdminBootstrap) {
      this.adminActionMessage = 'Se esta actualizando tu sesion de administrador. Intenta de nuevo en unos segundos.';
      return;
    }

    this.activandoAdminBootstrap = true;
    this.usuarioService.activarAdminBootstrap().subscribe({
      next: (usuario) => {
        this.activandoAdminBootstrap = false;
        this.authService.saveUser(usuario);
        this.adminAccessConfirmed = usuario.rol === 'ADMIN';
        if (!this.adminAccessConfirmed) {
          this.adminActionMessage = 'No se pudo habilitar tu cuenta como administrador.';
          this.isSavingAdminAction = false;
          return;
        }

        requestFactory().subscribe({
          next: (resultado) => {
            this.adminActionMessage = '';
            onSuccess(resultado);
          },
          error: (retryError) => this.manejarErrorAdmin(errorMessage, retryError)
        });
      },
      error: (bootstrapError) => {
        this.activandoAdminBootstrap = false;
        this.isSavingAdminAction = false;
        this.adminAccessConfirmed = false;
        this.sincronizarPermisosAdmin();
        this.adminActionMessage = this.extraerMensajeErrorHttp(
          bootstrapError as { error?: { message?: string; errors?: Record<string, string> } } | null,
          'Tu sesion actual no tiene permisos reales de administrador. La sesion local se sincronizo y se ocultaron las acciones admin.'
        );
      }
    });
  }
}

type RespuestaSubtema = {
  pregunta: PreguntaResponse;
  respuestaUsuario: RespuestaResponse | null;
  respuestaPareja: RespuestaResponse | null;
};

type VisualResultadoItem = {
  respuesta: RespuestaSubtema;
  index: number;
  opciones: VisualOption[];
};

type ProbabilidadResultadoItem = {
  respuesta: RespuestaSubtema;
  index: number;
  coincidencia: boolean;
};

type VisualOption = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

type EditableEntityType = 'tema' | 'subtema' | 'pregunta';
type ModalMode = 'crear' | 'editar';

type EditFormState = {
  id: number | null;
  nombre: string;
  descripcion: string;
  icono: string;
  activa: boolean;
};
