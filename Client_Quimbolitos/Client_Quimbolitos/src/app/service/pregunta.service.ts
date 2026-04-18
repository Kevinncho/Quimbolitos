import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreatePreguntaRequest {
  enunciado: string;
  descripcion?: string;
}

export interface UpdatePreguntaRequest {
  enunciado?: string;
  descripcion?: string;
  activa?: boolean;
}

export interface PreguntaResponse {
  id: number;
  enunciado: string;
  descripcion?: string;
  activa: boolean;
  subtemaId: number;
  subtemaNombre: string;
  subtemaIcono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreguntaService {
  constructor(private apiService: ApiService) {}

  getAllBySubtema(subtemaId: number): Observable<PreguntaResponse[]> {
    return this.apiService.get<PreguntaResponse[]>(`/subtemas/${subtemaId}/preguntas`);
  }

  getPreguntaById(id: number): Observable<PreguntaResponse> {
    return this.apiService.get<PreguntaResponse>(`/preguntas/${id}`);
  }

  createPregunta(subtemaId: number, pregunta: CreatePreguntaRequest): Observable<PreguntaResponse> {
    return this.apiService.post<PreguntaResponse>(`/subtemas/${subtemaId}/preguntas`, pregunta);
  }

  updatePregunta(id: number, pregunta: UpdatePreguntaRequest): Observable<PreguntaResponse> {
    return this.apiService.put<PreguntaResponse>(`/preguntas/${id}`, pregunta);
  }

  deletePregunta(id: number): Observable<void> {
    return this.apiService.delete<void>(`/preguntas/${id}`);
  }
}
