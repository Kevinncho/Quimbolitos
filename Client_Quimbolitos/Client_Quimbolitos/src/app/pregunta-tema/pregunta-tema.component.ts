import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../service/auth.service';
import { ApiService } from '../service/api.service';
import { PreguntaResponse, PreguntaService, UpdatePreguntaRequest } from '../service/pregunta.service';
import { RespuestaResponse, RespuestaService } from '../service/respuesta.service';
import { SubtemaService, UpdateSubtemaRequest } from '../service/subtema.service';
import { TemaService, UpdateTemaRequest } from '../service/tema.service';
import { VisualPreguntaResponse, VisualPreguntaService } from '../service/visual-pregunta.service';

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
  modoVisual = false;
  opcionesImagen: VisualOption[] = [];
  seleccionImagenId: string | null = null;
  modalEdicionAbierto = false;
  isSavingAdminAction = false;
  isLoadingAdminData = false;
  formularioEdicion: EditFormState = this.crearFormularioVacio();
  private visualConfig: VisualPreguntaResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService,
    private temaService: TemaService,
    private subtemaService: SubtemaService,
    private visualPreguntaService: VisualPreguntaService
  ) {}

  ngOnInit(): void {
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
    return this.authService.getUser()?.rol === 'ADMIN';
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

  abrirModalEdicion(): void {
    if (!this.pregunta || !this.esAdmin) {
      return;
    }

    this.modalEdicionAbierto = true;
    this.isLoadingAdminData = true;
    this.adminActionMessage = '';
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

        this.temaService.getTemaById(subtema.temaId).subscribe({
          next: (tema) => {
            this.formularioEdicion = {
              ...this.formularioEdicion,
              temaId: tema.id,
              tema: tema.nombre ?? '',
              temaDescripcion: tema.descripcion ?? ''
            };
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
    this.formularioEdicion = this.crearFormularioVacio();
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

    forkJoin({
      pregunta: this.preguntaService.updatePregunta(this.formularioEdicion.preguntaId, preguntaPayload),
      tema: this.temaService.updateTema(this.formularioEdicion.temaId, temaPayload),
      subtema: this.subtemaService.updateSubtema(this.formularioEdicion.subtemaId, subtemaPayload)
    }).subscribe({
      next: () => {
        this.isSavingAdminAction = false;
        this.cerrarModalEdicion();
        this.cargarPregunta(this.pregunta!.id);
        this.successMessage = 'Cambios guardados correctamente.';
      },
      error: (error) => {
        this.isSavingAdminAction = false;
        this.adminActionMessage = 'No se pudieron guardar los cambios.';
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
    this.seleccionImagenId = null;
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
      subtemaIcono: ''
    };
  }

  private valorOpcional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
}

type VisualOption = {
  id: string;
  label: string;
  src: string;
  alt: string;
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
};
