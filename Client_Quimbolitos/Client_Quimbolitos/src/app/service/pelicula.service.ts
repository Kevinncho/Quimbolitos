import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type GeneroPelicula =
  | 'ACCION'
  | 'AVENTURA'
  | 'ANIMACION'
  | 'CIENCIA_FICCION'
  | 'COMEDIA'
  | 'DOCUMENTAL'
  | 'DRAMA'
  | 'FANTASIA'
  | 'MUSICAL'
  | 'ROMANCE'
  | 'SUSPENSO'
  | 'TERROR';

export const GENEROS_PELICULA: { value: GeneroPelicula; label: string }[] = [
  { value: 'ACCION', label: 'Accion' },
  { value: 'AVENTURA', label: 'Aventura' },
  { value: 'ANIMACION', label: 'Animacion' },
  { value: 'CIENCIA_FICCION', label: 'Ciencia ficcion' },
  { value: 'COMEDIA', label: 'Comedia' },
  { value: 'DOCUMENTAL', label: 'Documental' },
  { value: 'DRAMA', label: 'Drama' },
  { value: 'FANTASIA', label: 'Fantasia' },
  { value: 'MUSICAL', label: 'Musical' },
  { value: 'ROMANCE', label: 'Romance' },
  { value: 'SUSPENSO', label: 'Suspenso' },
  { value: 'TERROR', label: 'Terror' }
];

export interface PeliculaResponse {
  id: number;
  titulo: string;
  descripcion?: string;
  linkVer: string;
  fotoUrl?: string;
  visto: boolean;
  generos: GeneroPelicula[];
  usuarioId: number;
  usuarioNombre: string;
  usuarioFotoPerfil?: string;
  fechaCreacion: string;
  ratingPromedio: number;
  totalResenas: number;
}

export interface ResenaPeliculaResponse {
  id: number;
  comentario?: string;
  rating: number;
  fechaActualizacion: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioFotoPerfil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  constructor(private apiService: ApiService) {}

  getPeliculas(): Observable<PeliculaResponse[]> {
    return this.apiService.get<PeliculaResponse[]>('/peliculas');
  }

  getPeliculaById(id: number): Observable<PeliculaResponse> {
    return this.apiService.get<PeliculaResponse>(`/peliculas/${id}`);
  }

  createPelicula(formData: FormData): Observable<PeliculaResponse> {
    return this.apiService.postFormData<PeliculaResponse>('/peliculas', formData);
  }

  updatePelicula(id: number, formData: FormData): Observable<PeliculaResponse> {
    return this.apiService.putFormData<PeliculaResponse>(`/peliculas/${id}`, formData);
  }

  deletePelicula(id: number): Observable<void> {
    return this.apiService.delete<void>(`/peliculas/${id}`);
  }

  getResenas(id: number): Observable<ResenaPeliculaResponse[]> {
    return this.apiService.get<ResenaPeliculaResponse[]>(`/peliculas/${id}/resenas`);
  }

  guardarResena(id: number, data: { comentario?: string; rating: number }): Observable<ResenaPeliculaResponse> {
    return this.apiService.put<ResenaPeliculaResponse>(`/peliculas/${id}/resena`, data);
  }
}
