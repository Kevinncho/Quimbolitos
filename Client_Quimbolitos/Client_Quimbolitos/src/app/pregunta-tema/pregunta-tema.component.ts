import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../service/auth.service';
import { ApiService } from '../service/api.service';
import { ParejaResponse, ParejaService } from '../service/pareja.service';
import { PreguntaResponse, PreguntaService, UpdatePreguntaRequest } from '../service/pregunta.service';
import { RespuestaResponse, RespuestaService } from '../service/respuesta.service';
import { SubtemaService, UpdateSubtemaRequest } from '../service/subtema.service';
import { TemaService, UpdateTemaRequest } from '../service/tema.service';
import { UpdateVisualPreguntaRequest, VisualPreguntaResponse, VisualPreguntaService } from '../service/visual-pregunta.service';

@Component({
  selector: 'app-pregunta-tema',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, RouterModule],
  templateUrl: './pregunta-tema.component.html',
  styleUrl: './pregunta-tema.component.css'
})
export class PreguntaTemaComponent implements OnInit {
  pregunta: PreguntaResponse | null = null;
  preguntasSubtema: PreguntaResponse[] = [];
  respuesta = '';
  respuestaId: number | null = null;
  isLoading = true;
  isSending = false;
  errorMessage = '';
  successMessage = '';
  adminActionMessage = '';
  adminAccessConfirmed = false;
  modoVisual = false;
  opcionesImagen: VisualOption[] = [];
  opcionesProbabilidad: ProbabilidadOption[] = [];
  seleccionImagenId: string | null = null;
  seleccionProbabilidadId: string | null = null;
  parejaActiva: ParejaResponse | null = null;
  modalEdicionAbierto = false;
  isSavingAdminAction = false;
  isLoadingAdminData = false;
  formularioEdicion: EditFormState = this.crearFormularioVacio();
  previewVisualAdminA: string | null = null;
  previewVisualAdminB: string | null = null;
  subiendoVisualAdminA = false;
  subiendoVisualAdminB = false;
  private visualConfig: VisualPreguntaResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private parejaService: ParejaService,
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService,
    private temaService: TemaService,
    private subtemaService: SubtemaService,
    private visualPreguntaService: VisualPreguntaService
  ) {}

  ngOnInit(): void {
    this.sincronizarPermisosAdmin();
    this.cargarParejaActiva();
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = Number(params.get('id'));
        this.cargarPregunta(id);
      }
    });
  }

  enviarRespuesta(): void {
    if (!this.pregunta || !this.respuesta.trim() || this.isSending) {
      return;
    }

    this.isSending = true;
    this.errorMessage = '';
    this.successMessage = '';
    const isUpdating = this.respuestaId !== null;

    const payload = {
      contenido: this.respuesta.trim()
    };

    const request$ = this.respuestaId
      ? this.respuestaService.updateRespuesta(this.respuestaId, payload)
      : this.respuestaService.createRespuesta(this.pregunta.id, payload);

    request$.subscribe({
      next: (respuestaGuardada) => {
        this.isSending = false;
        this.respuestaId = respuestaGuardada.id;
        this.respuesta = respuestaGuardada.contenido;
        this.successMessage = isUpdating
          ? 'Respuesta actualizada correctamente.'
          : 'Respuesta enviada correctamente.';
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = 'No se pudo enviar la respuesta.';
        console.error('Error sending respuesta:', error);
      }
    });
  }

  volverAPreguntas(): void {
    this.router.navigate(['/preguntas']);
  }

  get esAdmin(): boolean {
    return this.adminAccessConfirmed;
  }

  get puedeGuardarRespuesta(): boolean {
    if (this.modoVisual) {
      return !!this.seleccionImagenId && !this.isSending;
    }
    if (this.usaOpcionesProbabilidad) {
      return !!this.seleccionProbabilidadId && !this.isSending;
    }
    return !!this.respuesta.trim() && !this.isSending;
  }

  get esPreguntaVisualEditable(): boolean {
    return !!this.formularioEdicion.visualPreguntaId;
  }

  get esPreguntaQuienEsMasProbable(): boolean {
    const tema = this.normalizarTexto(this.pregunta?.temaNombre);
    return tema === 'quien es mas probable';
  }

  get usaOpcionesProbabilidad(): boolean {
    return this.esPreguntaQuienEsMasProbable && this.opcionesProbabilidad.length === 4;
  }

  get indicePreguntaActual(): number {
    if (!this.pregunta) {
      return -1;
    }
    return this.preguntasSubtema.findIndex((item) => item.id === this.pregunta?.id);
  }

  get puedeIrAnterior(): boolean {
    return this.indicePreguntaActual > 0;
  }

  get puedeIrSiguiente(): boolean {
    const indice = this.indicePreguntaActual;
    return indice >= 0 && indice < this.preguntasSubtema.length - 1;
  }

  get totalPreguntasNavegacion(): number {
    return this.preguntasSubtema.length || (this.pregunta ? 1 : 0);
  }

  get posicionPreguntaNavegacion(): number {
    const indice = this.indicePreguntaActual;
    if (indice >= 0) {
      return indice + 1;
    }
    return this.pregunta ? 1 : 0;
  }

  irAPreguntaAnterior(): void {
    if (!this.puedeIrAnterior) {
      return;
    }

    const anterior = this.preguntasSubtema[this.indicePreguntaActual - 1];
    if (anterior) {
      this.router.navigate(['/pregunta_tema', anterior.id]);
    }
  }

  irAPreguntaSiguiente(): void {
    if (!this.puedeIrSiguiente) {
      return;
    }

    const siguiente = this.preguntasSubtema[this.indicePreguntaActual + 1];
    if (siguiente) {
      this.router.navigate(['/pregunta_tema', siguiente.id]);
    }
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

  seleccionarOpcionImagen(opcionId: string): void {
    if (!this.modoVisual) {
      return;
    }
    this.seleccionImagenId = opcionId;
    this.respuesta = opcionId;
  }

  seleccionarOpcionProbabilidad(opcionId: string): void {
    if (!this.esPreguntaQuienEsMasProbable) {
      return;
    }
    this.seleccionProbabilidadId = opcionId;
    this.respuesta = opcionId;
  }

  abrirModalEdicion(): void {
    if (!this.pregunta || !this.esAdmin) {
      return;
    }

    this.modalEdicionAbierto = true;
    this.isLoadingAdminData = true;
    this.adminActionMessage = '';
    this.previewVisualAdminA = null;
    this.previewVisualAdminB = null;
    this.subiendoVisualAdminA = false;
    this.subiendoVisualAdminB = false;
    this.formularioEdicion = {
      ...this.crearFormularioVacio(),
      preguntaId: this.pregunta.id,
      pregunta: this.pregunta.enunciado ?? '',
      preguntaDescripcion: this.pregunta.descripcion ?? '',
      preguntaActiva: this.pregunta.activa,
      subtemaId: this.pregunta.subtemaId,
      subtema: this.pregunta.subtemaNombre ?? ''
    };

    this.subtemaService.getSubtemaById(this.pregunta.subtemaId).subscribe({
      next: (subtema) => {
        this.formularioEdicion = {
          ...this.formularioEdicion,
          subtemaId: subtema.id,
          subtema: subtema.nombre ?? '',
          subtemaDescripcion: subtema.descripcion ?? '',
          subtemaIcono: subtema.icono ?? '',
          temaId: subtema.temaId
        };

        forkJoin({
          tema: this.temaService.getTemaById(subtema.temaId),
          visual: this.visualPreguntaService.getByPreguntaId(this.pregunta!.id).pipe(
            catchError(() => of(null))
          )
        }).subscribe({
          next: ({ tema, visual }) => {
            this.formularioEdicion = {
              ...this.formularioEdicion,
              temaId: tema.id,
              tema: tema.nombre ?? '',
              temaDescripcion: tema.descripcion ?? '',
              visualPreguntaId: visual?.id ?? null,
              visualOpcionALabel: visual?.opcionALabel ?? '',
              visualOpcionASrc: visual?.opcionASrc ?? '',
              visualOpcionAAlt: visual?.opcionAAlt ?? '',
              visualOpcionAPositionY: this.normalizarPosicionVisual(visual?.opcionAPositionY),
              visualOpcionBLabel: visual?.opcionBLabel ?? '',
              visualOpcionBSrc: visual?.opcionBSrc ?? '',
              visualOpcionBAlt: visual?.opcionBAlt ?? '',
              visualOpcionBPositionY: this.normalizarPosicionVisual(visual?.opcionBPositionY)
            };
            this.previewVisualAdminA = this.resolverPreviewVisual(this.formularioEdicion.visualOpcionASrc);
            this.previewVisualAdminB = this.resolverPreviewVisual(this.formularioEdicion.visualOpcionBSrc);
            this.isLoadingAdminData = false;
          },
          error: (error) => {
            this.isLoadingAdminData = false;
            this.adminActionMessage = 'No se pudo cargar la informacion del tema.';
            console.error('Error loading tema for admin modal:', error);
          }
        });
      },
      error: (error) => {
        this.isLoadingAdminData = false;
        this.adminActionMessage = 'No se pudo cargar la informacion del subtema.';
        console.error('Error loading subtema for admin modal:', error);
      }
    });
  }

  cerrarModalEdicion(): void {
    if (this.isSavingAdminAction) {
      return;
    }

    this.modalEdicionAbierto = false;
    this.isLoadingAdminData = false;
    this.adminActionMessage = '';
    this.previewVisualAdminA = null;
    this.previewVisualAdminB = null;
    this.subiendoVisualAdminA = false;
    this.subiendoVisualAdminB = false;
    this.formularioEdicion = this.crearFormularioVacio();
  }

  onImagenVisualAdminSeleccionada(event: Event, opcion: 'A' | 'B'): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (opcion === 'A') {
      this.subiendoVisualAdminA = true;
    } else {
      this.subiendoVisualAdminB = true;
    }
    this.adminActionMessage = '';

    this.visualPreguntaService.uploadVisualImagen(file).subscribe({
      next: (response) => {
        const ruta = response.url ?? '';
        const preview = this.apiService.getAssetUrl(ruta);

        if (opcion === 'A') {
          this.formularioEdicion.visualOpcionASrc = ruta;
          if (!this.formularioEdicion.visualOpcionAAlt.trim()) {
            this.formularioEdicion.visualOpcionAAlt = file.name;
          }
          this.previewVisualAdminA = preview;
          this.subiendoVisualAdminA = false;
        } else {
          this.formularioEdicion.visualOpcionBSrc = ruta;
          if (!this.formularioEdicion.visualOpcionBAlt.trim()) {
            this.formularioEdicion.visualOpcionBAlt = file.name;
          }
          this.previewVisualAdminB = preview;
          this.subiendoVisualAdminB = false;
        }
      },
      error: (error) => {
        if (opcion === 'A') {
          this.subiendoVisualAdminA = false;
        } else {
          this.subiendoVisualAdminB = false;
        }
        this.adminActionMessage = 'No se pudo subir la imagen visual.';
        console.error('Error uploading visual image in admin modal:', error);
      }
    });
  }

  guardarEdicionAdmin(): void {
    if (!this.pregunta) {
      return;
    }

    const pregunta = this.formularioEdicion.pregunta.trim();
    const tema = this.formularioEdicion.tema.trim();
    const subtema = this.formularioEdicion.subtema.trim();

    if (!pregunta || !tema || !subtema) {
      this.adminActionMessage = 'Pregunta, tema y subtema son obligatorios.';
      return;
    }

    if (!this.formularioEdicion.preguntaId || !this.formularioEdicion.temaId || !this.formularioEdicion.subtemaId) {
      this.adminActionMessage = 'No se pudo identificar la entidad que se quiere editar.';
      return;
    }

    if (this.esPreguntaVisualEditable) {
      if (!this.formularioEdicion.visualOpcionASrc.trim() || !this.formularioEdicion.visualOpcionBSrc.trim()) {
        this.adminActionMessage = 'Las preguntas visuales necesitan las dos imagenes.';
        return;
      }
      if (!this.esRutaVisualValida(this.formularioEdicion.visualOpcionASrc) || !this.esRutaVisualValida(this.formularioEdicion.visualOpcionBSrc)) {
        this.adminActionMessage = 'Las imagenes visuales deben ser una URL valida o una ruta que empiece con /assets/.';
        return;
      }
    }

    this.isSavingAdminAction = true;
    this.adminActionMessage = '';

    const preguntaPayload: UpdatePreguntaRequest = {
      enunciado: pregunta,
      descripcion: this.valorOpcional(this.formularioEdicion.preguntaDescripcion),
      activa: this.formularioEdicion.preguntaActiva
    };

    const temaPayload: UpdateTemaRequest = {
      nombre: tema,
      descripcion: this.valorOpcional(this.formularioEdicion.temaDescripcion)
    };

    const subtemaPayload: UpdateSubtemaRequest = {
      nombre: subtema,
      descripcion: this.valorOpcional(this.formularioEdicion.subtemaDescripcion),
      icono: this.valorOpcional(this.formularioEdicion.subtemaIcono)
    };

    const requests: {
      pregunta: ReturnType<PreguntaService['updatePregunta']>;
      tema: ReturnType<TemaService['updateTema']>;
      subtema: ReturnType<SubtemaService['updateSubtema']>;
      visual?: ReturnType<VisualPreguntaService['updateVisualPregunta']>;
    } = {
      pregunta: this.preguntaService.updatePregunta(this.formularioEdicion.preguntaId, preguntaPayload),
      tema: this.temaService.updateTema(this.formularioEdicion.temaId, temaPayload),
      subtema: this.subtemaService.updateSubtema(this.formularioEdicion.subtemaId, subtemaPayload)
    };

    if (this.esPreguntaVisualEditable) {
      const visualPayload: UpdateVisualPreguntaRequest = {
        opcionALabel: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionALabel),
        opcionASrc: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionASrc),
        opcionAAlt: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionAAlt),
        opcionAPositionY: this.normalizarPosicionVisual(this.formularioEdicion.visualOpcionAPositionY),
        opcionBLabel: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionBLabel),
        opcionBSrc: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionBSrc),
        opcionBAlt: this.valorOpcionalONulo(this.formularioEdicion.visualOpcionBAlt),
        opcionBPositionY: this.normalizarPosicionVisual(this.formularioEdicion.visualOpcionBPositionY)
      };
      requests.visual = this.visualPreguntaService.updateVisualPregunta(this.formularioEdicion.preguntaId, visualPayload);
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.isSavingAdminAction = false;
        this.cerrarModalEdicion();
        this.cargarPregunta(this.pregunta!.id);
        this.successMessage = 'Cambios guardados correctamente.';
      },
      error: (error) => {
        this.isSavingAdminAction = false;
        if ((error as { status?: number } | null)?.status === 403) {
          this.adminAccessConfirmed = false;
          this.sincronizarPermisosAdmin();
          this.adminActionMessage = 'Tu sesion actual no tiene permisos reales de administrador. La sesion local se sincronizo y se ocultaron las acciones admin.';
        } else {
          this.adminActionMessage = 'No se pudieron guardar los cambios.';
        }
        console.error('Error saving admin changes:', error);
      }
    });
  }

  eliminarPreguntaActual(): void {
    if (!this.pregunta || !this.esAdmin) {
      return;
    }

    const confirmado = confirm(`Vas a eliminar la pregunta "${this.pregunta.enunciado}".`);
    if (!confirmado) {
      return;
    }

    this.preguntaService.deletePregunta(this.pregunta.id).subscribe({
      next: () => {
        this.router.navigate(['/preguntas']);
      },
      error: (error) => {
        this.errorMessage = 'No se pudo eliminar la pregunta.';
        console.error('Error deleting pregunta:', error);
      }
    });
  }

  private cargarPregunta(id: number): void {
    if (!id) {
      this.errorMessage = 'No se encontro la pregunta seleccionada.';
      this.isLoading = false;
      return;
    }

    this.resetEstadoCarga();

    this.preguntaService.getPreguntaById(id).subscribe({
      next: (pregunta) => {
        this.pregunta = pregunta;
        this.actualizarOpcionesProbabilidad();
        this.cargarPreguntasDelSubtema(pregunta.subtemaId);
        this.cargarConfigVisual(pregunta.id);
        this.cargarRespuestaGuardada(pregunta.id);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar la pregunta.';
        console.error('Error loading pregunta:', error);
      }
    });
  }

  private cargarRespuestaGuardada(preguntaId: number): void {
    const user = this.authService.getUser();

    if (!user) {
      this.isLoading = false;
      return;
    }

    this.respuestaService.getRespuestasByPregunta(preguntaId).subscribe({
      next: (respuestas) => {
        const respuestaActual = respuestas.find((respuesta) => respuesta.usuarioId === user.id) ?? null;
        this.aplicarRespuestaGuardada(respuestaActual);
        this.isLoading = false;
      },
      error: (error) => {
        this.aplicarRespuestaGuardada(null);
        this.isLoading = false;
        console.warn('No se pudo recuperar una respuesta previa. Se deja el campo vacio.', error);
      }
    });
  }

  private cargarPreguntasDelSubtema(subtemaId: number): void {
    this.preguntaService.getAllBySubtema(subtemaId).subscribe({
      next: (preguntas) => {
        this.preguntasSubtema = preguntas;
      },
      error: (error) => {
        this.preguntasSubtema = [];
        console.warn('No se pudo cargar la lista del subtema para navegar entre preguntas.', error);
      }
    });
  }

  private aplicarRespuestaGuardada(respuestaGuardada: RespuestaResponse | null): void {
    this.respuestaId = respuestaGuardada?.id ?? null;
    this.respuesta = respuestaGuardada?.contenido ?? '';
    if (this.modoVisual && this.respuesta) {
      this.seleccionImagenId = this.respuesta;
    }
    this.seleccionProbabilidadId = this.esOpcionProbabilidadValida(this.respuesta) ? this.respuesta : null;
  }

  private cargarConfigVisual(preguntaId: number): void {
    this.visualPreguntaService.getByPreguntaId(preguntaId).subscribe({
      next: (config) => {
        this.visualConfig = config;
        this.opcionesImagen = this.convertirOpciones(config);
        this.modoVisual = this.opcionesImagen.length > 0;
      },
      error: () => {
        this.visualConfig = null;
        this.modoVisual = false;
        this.opcionesImagen = [];
      }
    });
  }

  private convertirOpciones(config: VisualPreguntaResponse): VisualOption[] {
    return [
      {
        id: 'A',
        label: config.opcionALabel?.trim() || 'Opcion A',
        src: this.normalizarSrc(config.opcionASrc),
        alt: config.opcionAAlt?.trim() || 'Opcion A',
        positionY: this.normalizarPosicionVisual(config.opcionAPositionY)
      },
      {
        id: 'B',
        label: config.opcionBLabel?.trim() || 'Opcion B',
        src: this.normalizarSrc(config.opcionBSrc),
        alt: config.opcionBAlt?.trim() || 'Opcion B',
        positionY: this.normalizarPosicionVisual(config.opcionBPositionY)
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

  private cargarParejaActiva(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.parejaActiva = null;
      this.opcionesProbabilidad = [];
      return;
    }

    this.parejaService.getMyPairs().subscribe({
      next: (parejas) => {
        this.parejaActiva = parejas.find((pareja) => pareja.estado === 'ACTIVA') ?? null;
        this.actualizarOpcionesProbabilidad();
      },
      error: () => {
        this.parejaActiva = null;
        this.opcionesProbabilidad = [];
      }
    });
  }

  private actualizarOpcionesProbabilidad(): void {
    if (!this.esPreguntaQuienEsMasProbable) {
      this.opcionesProbabilidad = [];
      return;
    }

    const user = this.authService.getUser();
    const pareja = this.parejaActiva;
    if (!user) {
      this.opcionesProbabilidad = [];
      return;
    }

    if (!pareja) {
      this.opcionesProbabilidad = [
        {
          id: 'USUARIO_UNO',
          label: user.nombre,
          fotoPerfil: this.authService.resolveFotoPerfilUrl(user.fotoPerfil),
          layout: 'card'
        },
        {
          id: 'AMBOS',
          label: 'Ambos',
          layout: 'wide'
        },
        {
          id: 'USUARIO_DOS',
          label: 'Tu pareja',
          fotoPerfil: '/assets/sinuser.svg',
          layout: 'card'
        },
        {
          id: 'NINGUNO',
          label: 'Ninguno',
          layout: 'wide'
        }
      ];
      return;
    }

    const usuarioUnoFoto = this.authService.resolveFotoPerfilUrl(pareja.usuarioUnoFotoPerfil);
    const usuarioDosFoto = this.authService.resolveFotoPerfilUrl(pareja.usuarioDosFotoPerfil);

    this.opcionesProbabilidad = [
      {
        id: 'USUARIO_UNO',
        label: pareja.usuarioUnoNombre,
        fotoPerfil: usuarioUnoFoto,
        layout: 'card'
      },
      {
        id: 'USUARIO_DOS',
        label: pareja.usuarioDosNombre,
        fotoPerfil: usuarioDosFoto,
        layout: 'card'
      },
      {
        id: 'AMBOS',
        label: 'Ambos',
        layout: 'wide'
      },
      {
        id: 'NINGUNO',
        label: 'Ninguno',
        layout: 'wide'
      }
    ];
  }

  private resetEstadoCarga(): void {
    this.pregunta = null;
    this.respuesta = '';
    this.respuestaId = null;
    this.isLoading = true;
    this.isSending = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.modoVisual = false;
    this.opcionesImagen = [];
    this.opcionesProbabilidad = [];
    this.seleccionImagenId = null;
    this.seleccionProbabilidadId = null;
    this.visualConfig = null;
  }

  private crearFormularioVacio(): EditFormState {
    return {
      preguntaId: null,
      pregunta: '',
      preguntaDescripcion: '',
      preguntaActiva: true,
      temaId: null,
      tema: '',
      temaDescripcion: '',
      subtemaId: null,
      subtema: '',
      subtemaDescripcion: '',
      subtemaIcono: '',
      visualPreguntaId: null,
      visualOpcionALabel: '',
      visualOpcionASrc: '',
      visualOpcionAAlt: '',
      visualOpcionAPositionY: 50,
      visualOpcionBLabel: '',
      visualOpcionBSrc: '',
      visualOpcionBAlt: '',
      visualOpcionBPositionY: 50
    };
  }

  getObjectPosition(positionY?: number | null): string {
    return `center ${this.normalizarPosicionVisual(positionY)}%`;
  }

  private valorOpcional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private valorOpcionalONulo(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private resolverPreviewVisual(src: string): string | null {
    const trimmed = src.trim();
    return trimmed ? this.apiService.getAssetUrl(trimmed) : null;
  }

  private esRutaVisualValida(src?: string | null): boolean {
    const value = src?.trim() ?? '';
    if (!value) {
      return false;
    }
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/assets/') || value.startsWith('assets/');
  }

  private normalizarPosicionVisual(value?: number | null): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 50;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private normalizarTexto(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private esOpcionProbabilidadValida(value?: string | null): value is ProbabilidadOptionId {
    return value === 'USUARIO_UNO' || value === 'AMBOS' || value === 'USUARIO_DOS' || value === 'NINGUNO';
  }
}

type VisualOption = {
  id: string;
  label: string;
  src: string;
  alt: string;
  positionY: number;
};

type ProbabilidadOptionId = 'USUARIO_UNO' | 'USUARIO_DOS' | 'AMBOS' | 'NINGUNO';

type ProbabilidadOption = {
  id: ProbabilidadOptionId;
  label: string;
  fotoPerfil?: string;
  layout: 'card' | 'wide';
};

type EditFormState = {
  preguntaId: number | null;
  pregunta: string;
  preguntaDescripcion: string;
  preguntaActiva: boolean;
  temaId: number | null;
  tema: string;
  temaDescripcion: string;
  subtemaId: number | null;
  subtema: string;
  subtemaDescripcion: string;
  subtemaIcono: string;
  visualPreguntaId: number | null;
  visualOpcionALabel: string;
  visualOpcionASrc: string;
  visualOpcionAAlt: string;
  visualOpcionAPositionY: number;
  visualOpcionBLabel: string;
  visualOpcionBSrc: string;
  visualOpcionBAlt: string;
  visualOpcionBPositionY: number;
};
