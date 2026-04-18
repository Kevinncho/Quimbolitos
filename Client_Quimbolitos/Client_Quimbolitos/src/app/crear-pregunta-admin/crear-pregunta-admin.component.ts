import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ApiService } from '../service/api.service';
import { PreguntaService } from '../service/pregunta.service';
import { SubtemaResponse, SubtemaService } from '../service/subtema.service';
import { TemaResponse, TemaService } from '../service/tema.service';
import { CreateVisualPreguntaRequest, VisualPreguntaService } from '../service/visual-pregunta.service';

type TipoPregunta = 'texto' | 'visual';

@Component({
  selector: 'app-crear-pregunta-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-pregunta-admin.component.html',
  styleUrl: './crear-pregunta-admin.component.css'
})
export class CrearPreguntaAdminComponent implements OnInit {
  temas: TemaResponse[] = [];
  subtemas: SubtemaResponse[] = [];
  temaSeleccionadoId: number | null = null;
  subtemaSeleccionadoId: number | null = null;

  enunciado = '';
  descripcion = '';
  tipoPregunta: TipoPregunta = 'texto';

  visual: CreateVisualPreguntaRequest = {
    opcionALabel: '',
    opcionASrc: '',
    opcionAAlt: '',
    opcionBLabel: '',
    opcionBSrc: '',
    opcionBAlt: ''
  };

  previewA: string | null = null;
  previewB: string | null = null;
  subiendoA = false;
  subiendoB = false;

  isLoadingTemas = false;
  isLoadingSubtemas = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  noAutorizado = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private temaService: TemaService,
    private subtemaService: SubtemaService,
    private preguntaService: PreguntaService,
    private visualPreguntaService: VisualPreguntaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || user.rol !== 'ADMIN') {
      this.noAutorizado = true;
      this.errorMessage = 'Acceso restringido. Solo administradores pueden crear preguntas.';
      return;
    }

    this.cargarTemas();
  }

  cargarTemas(): void {
    this.isLoadingTemas = true;
    this.errorMessage = '';

    this.temaService.getAllTemas().subscribe({
      next: (temas) => {
        this.temas = temas;
        this.isLoadingTemas = false;
        if (temas.length > 0) {
          this.seleccionarTema(temas[0].id);
        }
      },
      error: (error) => {
        console.error('Error loading temas:', error);
        this.isLoadingTemas = false;
        this.errorMessage = 'No se pudieron cargar los temas.';
      }
    });
  }

  seleccionarTema(temaId: number | null): void {
    this.temaSeleccionadoId = temaId;
    this.subtemaSeleccionadoId = null;
    this.subtemas = [];

    if (!temaId) {
      return;
    }

    this.isLoadingSubtemas = true;
    this.subtemaService.getAllByTema(temaId).subscribe({
      next: (subtemas) => {
        this.subtemas = subtemas;
        this.isLoadingSubtemas = false;
        if (subtemas.length > 0) {
          this.subtemaSeleccionadoId = subtemas[0].id;
        }
      },
      error: (error) => {
        console.error('Error loading subtemas:', error);
        this.isLoadingSubtemas = false;
        this.errorMessage = 'No se pudieron cargar los subtemas.';
      }
    });
  }

  seleccionarSubtema(subtemaId: number | null): void {
    this.subtemaSeleccionadoId = subtemaId;
  }

  setTipoPregunta(tipo: TipoPregunta): void {
    this.tipoPregunta = tipo;
  }

  onImagenSeleccionada(event: Event, opcion: 'A' | 'B'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.setPreview(opcion, null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    this.setPreview(opcion, objectUrl);

    if (opcion === 'A') {
      this.subiendoA = true;
    } else {
      this.subiendoB = true;
    }

    this.visualPreguntaService.uploadVisualImagen(file).subscribe({
      next: (response) => {
        const resolvedUrl = this.apiService.getAssetUrl(response.url);
        if (opcion === 'A') {
          this.visual.opcionASrc = response.url;
          this.subiendoA = false;
          if (!this.visual.opcionAAlt?.trim()) {
            this.visual.opcionAAlt = file.name;
          }
          this.setPreview(opcion, resolvedUrl);
        } else {
          this.visual.opcionBSrc = response.url;
          this.subiendoB = false;
          if (!this.visual.opcionBAlt?.trim()) {
            this.visual.opcionBAlt = file.name;
          }
          this.setPreview(opcion, resolvedUrl);
        }
      },
      error: (error) => {
        console.error('Error uploading visual image:', error);
        if (opcion === 'A') {
          this.subiendoA = false;
        } else {
          this.subiendoB = false;
        }
        this.errorMessage = 'No se pudo subir la imagen. Intenta con otro archivo.';
      }
    });
  }

  guardarPregunta(): void {
    if (!this.subtemaSeleccionadoId) {
      this.errorMessage = 'Selecciona un subtema antes de guardar.';
      return;
    }

    if (!this.enunciado.trim()) {
      this.errorMessage = 'El enunciado es obligatorio.';
      return;
    }

    if (this.tipoPregunta === 'visual') {
      if (!this.visual.opcionASrc?.trim() || !this.visual.opcionBSrc?.trim()) {
        this.errorMessage = 'Debes agregar las dos imagenes para una pregunta visual.';
        return;
      }
      if (!this.esRutaValida(this.visual.opcionASrc) || !this.esRutaValida(this.visual.opcionBSrc)) {
        this.errorMessage = 'Las imagenes deben ser una URL valida o una ruta que empiece con /assets/.';
        return;
      }
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      enunciado: this.enunciado.trim(),
      descripcion: this.descripcion.trim() || undefined
    };

    this.preguntaService.createPregunta(this.subtemaSeleccionadoId, payload).subscribe({
      next: (pregunta) => {
        if (this.tipoPregunta !== 'visual') {
          this.finalizarGuardado();
          return;
        }

        const visualPayload: CreateVisualPreguntaRequest = {
          opcionALabel: this.visual.opcionALabel?.trim() || undefined,
          opcionASrc: this.visual.opcionASrc?.trim() || '',
          opcionAAlt: this.visual.opcionAAlt?.trim() || undefined,
          opcionBLabel: this.visual.opcionBLabel?.trim() || undefined,
          opcionBSrc: this.visual.opcionBSrc?.trim() || '',
          opcionBAlt: this.visual.opcionBAlt?.trim() || undefined
        };

        this.visualPreguntaService.createVisualPregunta(pregunta.id, visualPayload).subscribe({
          next: () => this.finalizarGuardado(),
          error: (error) => {
            console.error('Error creating visual config:', error);
            this.isSaving = false;
            this.errorMessage = 'La pregunta se guardo, pero no la configuracion visual.';
          }
        });
      },
      error: (error) => {
        console.error('Error creating pregunta:', error);
        this.isSaving = false;
        this.errorMessage = 'No se pudo guardar la pregunta.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/preguntas']);
  }

  private finalizarGuardado(): void {
    this.isSaving = false;
    this.successMessage = 'Pregunta guardada correctamente.';
    this.enunciado = '';
    this.descripcion = '';
    this.tipoPregunta = 'texto';
    this.visual = {
      opcionALabel: '',
      opcionASrc: '',
      opcionAAlt: '',
      opcionBLabel: '',
      opcionBSrc: '',
      opcionBAlt: ''
    };
    this.setPreview('A', null);
    this.setPreview('B', null);
  }

  private esRutaValida(src?: string | null): boolean {
    const value = src?.trim() ?? '';
    if (!value) {
      return false;
    }
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/assets/') || value.startsWith('assets/');
  }

  private setPreview(opcion: 'A' | 'B', value: string | null): void {
    if (opcion === 'A') {
      if (this.previewA) {
        URL.revokeObjectURL(this.previewA);
      }
      this.previewA = value;
      return;
    }
    if (this.previewB) {
      URL.revokeObjectURL(this.previewB);
    }
    this.previewB = value;
  }
}
