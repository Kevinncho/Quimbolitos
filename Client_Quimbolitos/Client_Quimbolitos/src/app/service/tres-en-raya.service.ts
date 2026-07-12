import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TresEnRayaEstadoResponse {
  id: number;
  jugadorXId: number;
  jugadorOId: number;
  turnoJugadorId: number;
  simboloTurno: 'X' | 'O';
  estado: 'ACTIVA' | 'X_GANA' | 'O_GANA' | 'EMPATE';
  ganador?: 'X' | 'O' | null;
  tablero: string[];
  winningCells: number[];
  marcadorX: number;
  marcadorO: number;
  empates: number;
  rondasJugadas: number;
  terminado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TresEnRayaService {
  constructor(private apiService: ApiService) {}

  iniciar(): Observable<TresEnRayaEstadoResponse> {
    return this.apiService.post<TresEnRayaEstadoResponse>('/juegos/tres-en-raya/iniciar', {});
  }

  estado(): Observable<TresEnRayaEstadoResponse> {
    return this.apiService.get<TresEnRayaEstadoResponse>('/juegos/tres-en-raya/estado');
  }

  jugar(posicion: number): Observable<TresEnRayaEstadoResponse> {
    return this.apiService.post<TresEnRayaEstadoResponse>('/juegos/tres-en-raya/jugar', { posicion });
  }

  nuevaRonda(): Observable<TresEnRayaEstadoResponse> {
    return this.apiService.post<TresEnRayaEstadoResponse>('/juegos/tres-en-raya/nueva-ronda', {});
  }

  reiniciarSerie(): Observable<TresEnRayaEstadoResponse> {
    return this.apiService.post<TresEnRayaEstadoResponse>('/juegos/tres-en-raya/reiniciar-serie', {});
  }

  cancelarPartidaActiva(): Observable<void> {
    return this.apiService.delete<void>('/juegos/tres-en-raya/estado');
  }
}
