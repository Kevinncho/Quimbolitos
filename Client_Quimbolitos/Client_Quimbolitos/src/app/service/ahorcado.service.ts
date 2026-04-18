import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AhorcadoEstadoResponse {
  id: number;
  creadorId: number;
  adivinadorId: number;
  estado: string;
  pista: string;
  palabraVisible: string[];
  letrasUsadas: string[];
  errores: number;
  maxErrores: number;
  terminado: boolean;
  gano: boolean;
  palabraSecreta?: string | null;
}

export interface AhorcadoStartRequest {
  palabra: string;
  pista?: string;
}

export interface AhorcadoJugarRequest {
  letra: string;
}

export interface AhorcadoHistorialItem {
  id: number;
  estado: string;
  palabra: string;
  pista?: string;
  fechaCreacion: string;
  creadorId: number;
  adivinadorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AhorcadoService {
  constructor(private apiService: ApiService) {}

  iniciar(request: AhorcadoStartRequest): Observable<AhorcadoEstadoResponse> {
    return this.apiService.post<AhorcadoEstadoResponse>('/juegos/ahorcado/iniciar', request);
  }

  estado(): Observable<AhorcadoEstadoResponse> {
    return this.apiService.get<AhorcadoEstadoResponse>('/juegos/ahorcado/estado');
  }

  jugar(request: AhorcadoJugarRequest): Observable<AhorcadoEstadoResponse> {
    return this.apiService.post<AhorcadoEstadoResponse>('/juegos/ahorcado/jugar', request);
  }

  historial(): Observable<AhorcadoHistorialItem[]> {
    return this.apiService.get<AhorcadoHistorialItem[]>('/juegos/ahorcado/historial');
  }

  borrarHistorial(): Observable<void> {
    return this.apiService.delete<void>('/juegos/ahorcado/historial');
  }

  cancelarPartidaActiva(): Observable<void> {
    return this.apiService.delete<void>('/juegos/ahorcado/estado');
  }
}
