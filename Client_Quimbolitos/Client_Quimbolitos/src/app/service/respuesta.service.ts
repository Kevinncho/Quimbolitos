import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateRespuestaRequest {
  contenido: string;
}

export interface RespuestaResponse {
  id: number;
  contenido: string;
  fechaRespuesta: string;
  preguntaId: number;
  preguntaEnunciado: string;
  usuarioId: number;
  usuarioNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RespuestaService {
  constructor(private apiService: ApiService) {}

  getRespuestasByPregunta(preguntaId: number): Observable<RespuestaResponse[]> {
    return this.apiService.get<RespuestaResponse[]>(`/preguntas/${preguntaId}/respuestas`);
  }

  createRespuesta(preguntaId: number, payload: CreateRespuestaRequest): Observable<RespuestaResponse> {
    return this.apiService.post<RespuestaResponse>(`/preguntas/${preguntaId}/respuestas`, payload);
  }

  updateRespuesta(respuestaId: number, payload: CreateRespuestaRequest): Observable<RespuestaResponse> {
    return this.apiService.put<RespuestaResponse>(`/respuestas/${respuestaId}`, payload);
  }
}
