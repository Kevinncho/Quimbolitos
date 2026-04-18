import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CancionResponse {
  id: number;
  titulo: string;
  artista?: string;
  album?: string;
  url?: string;
  audioUrl?: string;
  dedicatoria?: string;
  usuarioId: number;
  usuarioNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CancionService {
  constructor(private apiService: ApiService) {}

  getCanciones(): Observable<CancionResponse[]> {
    return this.apiService.get<CancionResponse[]>('/canciones');
  }

  getCancionesOrden(orden: 'fecha' | 'usuario'): Observable<CancionResponse[]> {
    return this.apiService.get<CancionResponse[]>('/canciones', { orden });
  }

  createCancion(formData: FormData): Observable<CancionResponse> {
    return this.apiService.postFormData<CancionResponse>('/canciones', formData);
  }

  updateCancion(id: number, formData: FormData): Observable<CancionResponse> {
    return this.apiService.putFormData<CancionResponse>(`/canciones/${id}`, formData);
  }

  deleteCancion(id: number): Observable<void> {
    return this.apiService.delete<void>(`/canciones/${id}`);
  }
}
