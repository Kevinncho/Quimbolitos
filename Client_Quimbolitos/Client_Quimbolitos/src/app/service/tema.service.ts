import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateTemaRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateTemaRequest {
  nombre?: string;
  descripcion?: string;
}

export interface TemaResponse {
  id: number;
  nombre: string;
  descripcion?: string;
  totalSubtemas: number;
}

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  constructor(private apiService: ApiService) {}

  getAllTemas(): Observable<TemaResponse[]> {
    return this.apiService.get<TemaResponse[]>('/temas');
  }

  getTemaById(id: number): Observable<TemaResponse> {
    return this.apiService.get<TemaResponse>(`/temas/${id}`);
  }

  createTema(tema: CreateTemaRequest): Observable<TemaResponse> {
    return this.apiService.post<TemaResponse>('/temas', tema);
  }

  updateTema(id: number, tema: UpdateTemaRequest): Observable<TemaResponse> {
    return this.apiService.put<TemaResponse>(`/temas/${id}`, tema);
  }

  deleteTema(id: number): Observable<void> {
    return this.apiService.delete<void>(`/temas/${id}`);
  }
}
