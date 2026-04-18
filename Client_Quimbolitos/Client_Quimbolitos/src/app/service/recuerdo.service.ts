import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface RecuerdoResponse {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaRecuerdo: string;
  fotoUrl?: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioFotoPerfil?: string;
  mensajesCount?: number;
}

export interface MensajeRecuerdoResponse {
  id: number;
  autor: string;
  contenido: string;
  fechaEnvio: string;
  usuarioId?: number;
  usuarioFotoPerfil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecuerdoService {
  constructor(private apiService: ApiService) {}

  getRecuerdos(): Observable<RecuerdoResponse[]> {
    return this.apiService.get<RecuerdoResponse[]>('/recuerdos');
  }

  getRecuerdoById(id: number): Observable<RecuerdoResponse> {
    return this.apiService.get<RecuerdoResponse>(`/recuerdos/${id}`);
  }

  getMensajes(id: number): Observable<MensajeRecuerdoResponse[]> {
    return this.apiService.get<MensajeRecuerdoResponse[]>(`/recuerdos/${id}/mensajes`);
  }

  crearMensaje(id: number, contenido: string): Observable<MensajeRecuerdoResponse> {
    return this.apiService.post<MensajeRecuerdoResponse>(`/recuerdos/${id}/mensajes`, { contenido });
  }

  createRecuerdo(formData: FormData): Observable<RecuerdoResponse> {
    return this.apiService.postFormData<RecuerdoResponse>('/recuerdos', formData);
  }

  updateRecuerdo(id: number, formData: FormData): Observable<RecuerdoResponse> {
    return this.apiService.putFormData<RecuerdoResponse>(`/recuerdos/${id}`, formData);
  }

  deleteRecuerdo(id: number): Observable<void> {
    return this.apiService.delete<void>(`/recuerdos/${id}`);
  }
}
