import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface EstadoEmocionalResponse {
  id: number | null;
  parejaId: number;
  usuarioId: number;
  usuarioNombre: string;
  estado: string | null;
  emoji: string | null;
  fechaActualizacion: string | null;
}

export interface UpdateEstadoEmocionalRequest {
  estado: string;
  emoji: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoEmocionalService {
  constructor(private apiService: ApiService) {}

  getEstadosDeMiPareja(): Observable<EstadoEmocionalResponse[]> {
    return this.apiService.get<EstadoEmocionalResponse[]>('/estados-emocionales/pareja');
  }

  updateMiEstado(payload: UpdateEstadoEmocionalRequest): Observable<EstadoEmocionalResponse> {
    return this.apiService.put<EstadoEmocionalResponse>('/estados-emocionales/me', payload);
  }
}
