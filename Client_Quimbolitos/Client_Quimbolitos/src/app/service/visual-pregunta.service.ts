import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VisualPreguntaResponse {
  id: number;
  preguntaId: number;
  opcionALabel?: string | null;
  opcionASrc?: string | null;
  opcionAAlt?: string | null;
  opcionBLabel?: string | null;
  opcionBSrc?: string | null;
  opcionBAlt?: string | null;
}

export interface CreateVisualPreguntaRequest {
  opcionALabel?: string | null;
  opcionASrc: string;
  opcionAAlt?: string | null;
  opcionBLabel?: string | null;
  opcionBSrc: string;
  opcionBAlt?: string | null;
}

export interface VisualImagenResponse {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisualPreguntaService {
  constructor(private apiService: ApiService) {}

  getByPreguntaId(preguntaId: number): Observable<VisualPreguntaResponse> {
    return this.apiService.get<VisualPreguntaResponse>(`/preguntas/${preguntaId}/visual`);
  }

  getBySubtemaId(subtemaId: number): Observable<VisualPreguntaResponse[]> {
    return this.apiService.get<VisualPreguntaResponse[]>(`/subtemas/${subtemaId}/visual-preguntas`);
  }

  createVisualPregunta(
    preguntaId: number,
    payload: CreateVisualPreguntaRequest
  ): Observable<VisualPreguntaResponse> {
    return this.apiService.post<VisualPreguntaResponse>(`/preguntas/${preguntaId}/visual`, payload);
  }

  uploadVisualImagen(file: File): Observable<VisualImagenResponse> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.apiService.postFormData<VisualImagenResponse>('/preguntas/visual/imagen', formData);
  }
}
