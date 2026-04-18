import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UsuarioResponse } from './auth.service';

export interface UpdateUsuarioRequest {
  nombre?: string;
  alias?: string;
  email?: string;
  password?: string;
  fechaNacimiento?: string;
  biografia?: string;
  fotoPerfil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private apiService: ApiService) {}

  getMiPerfil(): Observable<UsuarioResponse> {
    return this.apiService.get<UsuarioResponse>('/usuarios/me');
  }

  updateMiPerfil(payload: UpdateUsuarioRequest): Observable<UsuarioResponse> {
    return this.apiService.put<UsuarioResponse>('/usuarios/me', payload);
  }

  uploadFotoPerfil(file: File): Observable<UsuarioResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.postFormData<UsuarioResponse>('/usuarios/me/foto', formData);
  }

  buscarPorEmail(email: string): Observable<UsuarioResponse> {
    return this.apiService.get<UsuarioResponse>('/usuarios/buscar', { email });
  }
}
