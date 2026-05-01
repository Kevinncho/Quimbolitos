import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateParejaRequest {
  usuarioInvitadoId: number;
}

export interface ParejaResponse {
  id: number;
  estado: string;
  codigoInvitacion: string;
  fechaCreacion: string;
  fechaRespuesta?: string;
  usuarioUnoId: number;
  usuarioUnoNombre: string;
  usuarioUnoFotoPerfil?: string;
  usuarioUnoLatitud?: number;
  usuarioUnoLongitud?: number;
  usuarioDosId: number;
  usuarioDosNombre: string;
  usuarioDosFotoPerfil?: string;
  usuarioDosLatitud?: number;
  usuarioDosLongitud?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParejaService {
  constructor(private apiService: ApiService) {}

  createInvitation(pareja: CreateParejaRequest): Observable<ParejaResponse> {
    return this.apiService.post<ParejaResponse>('/parejas', pareja);
  }

  getMyPairs(): Observable<ParejaResponse[]> {
    return this.apiService.get<ParejaResponse[]>('/parejas/me');
  }

  getParejaById(id: number): Observable<ParejaResponse> {
    return this.apiService.get<ParejaResponse>(`/parejas/${id}`);
  }

  acceptInvitation(id: number): Observable<ParejaResponse> {
    return this.apiService.post<ParejaResponse>(`/parejas/${id}/aceptar`, {});
  }

  rejectInvitation(id: number): Observable<ParejaResponse> {
    return this.apiService.post<ParejaResponse>(`/parejas/${id}/rechazar`, {});
  }

  deletePareja(id: number): Observable<void> {
    return this.apiService.delete<void>(`/parejas/${id}`);
  }
}
