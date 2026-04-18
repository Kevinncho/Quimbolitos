import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateSubtemaRequest {
  nombre: string;
  descripcion?: string;
  icono?: string;
}

export interface UpdateSubtemaRequest {
  nombre?: string;
  descripcion?: string;
  icono?: string;
}

export interface SubtemaResponse {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  temaId: number;
  temaNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubtemaService {
  constructor(private apiService: ApiService) {}

  getAllByTema(temaId: number): Observable<SubtemaResponse[]> {
    return this.apiService.get<SubtemaResponse[]>(`/temas/${temaId}/subtemas`);
  }

  getSubtemaById(id: number): Observable<SubtemaResponse> {
    return this.apiService.get<SubtemaResponse>(`/subtemas/${id}`);
  }

  createSubtema(temaId: number, subtema: CreateSubtemaRequest): Observable<SubtemaResponse> {
    return this.apiService.post<SubtemaResponse>(`/temas/${temaId}/subtemas`, subtema);
  }

  updateSubtema(id: number, subtema: UpdateSubtemaRequest): Observable<SubtemaResponse> {
    return this.apiService.put<SubtemaResponse>(`/subtemas/${id}`, subtema);
  }

  deleteSubtema(id: number): Observable<void> {
    return this.apiService.delete<void>(`/subtemas/${id}`);
  }
}
