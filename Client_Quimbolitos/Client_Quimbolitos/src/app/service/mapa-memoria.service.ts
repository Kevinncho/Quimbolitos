import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface RecuerdoMapaItem {
  id: number;
  titulo: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  fechaRecuerdo: string;
  fotoUrl?: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioFotoPerfil?: string;
  paisNombre?: string;
  ciudadNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapaMemoriaService {
  constructor(private apiService: ApiService) {}

  getRecuerdosMapa(): Observable<RecuerdoMapaItem[]> {
    return this.apiService.get<RecuerdoMapaItem[]>('/recuerdos-mapa');
  }

  getRecuerdoMapaById(id: number): Observable<RecuerdoMapaItem> {
    return this.apiService.get<RecuerdoMapaItem>(`/recuerdos-mapa/${id}`);
  }

  guardarRecuerdoMapa(
    recuerdo: Omit<RecuerdoMapaItem, 'id' | 'fechaRecuerdo' | 'usuarioId' | 'usuarioNombre' | 'usuarioFotoPerfil'>,
    imagen?: File | null
  ): Observable<RecuerdoMapaItem> {
    const formData = new FormData();
    formData.append('titulo', recuerdo.titulo);
    formData.append('descripcion', recuerdo.descripcion || '');
    formData.append('latitud', recuerdo.latitud.toString());
    formData.append('longitud', recuerdo.longitud.toString());
    formData.append('fechaRecuerdo', new Date().toISOString().split('T')[0]); // Solo fecha
    if (recuerdo.paisNombre) formData.append('paisNombre', recuerdo.paisNombre);
    if (recuerdo.ciudadNombre) formData.append('ciudadNombre', recuerdo.ciudadNombre);
    if (imagen) {
      formData.append('imagen', imagen, imagen.name);
    } else if (recuerdo.fotoUrl && recuerdo.fotoUrl.startsWith('data:')) {
      const base64Data = recuerdo.fotoUrl.split(',')[1];
      const mimeType = recuerdo.fotoUrl.split(',')[0].split(':')[1].split(';')[0];
      const blob = this.base64ToBlob(base64Data, mimeType);
      formData.append('imagen', blob, 'imagen.jpg');
    }

    return this.apiService.postFormData<RecuerdoMapaItem>('/recuerdos-mapa', formData);
  }

  actualizarRecuerdoMapa(
    id: number,
    cambios: Partial<Omit<RecuerdoMapaItem, 'id' | 'usuarioId' | 'usuarioNombre' | 'usuarioFotoPerfil'>>,
    imagen?: File | null
  ): Observable<RecuerdoMapaItem> {
    const formData = new FormData();
    if (cambios.titulo) formData.append('titulo', cambios.titulo);
    if (cambios.descripcion !== undefined) formData.append('descripcion', cambios.descripcion || '');
    if (cambios.latitud !== undefined) formData.append('latitud', cambios.latitud.toString());
    if (cambios.longitud !== undefined) formData.append('longitud', cambios.longitud.toString());
    if (cambios.fechaRecuerdo) formData.append('fechaRecuerdo', cambios.fechaRecuerdo);
    if (cambios.paisNombre) formData.append('paisNombre', cambios.paisNombre);
    if (cambios.ciudadNombre) formData.append('ciudadNombre', cambios.ciudadNombre);
    if (imagen) {
      formData.append('imagen', imagen, imagen.name);
    } else if (cambios.fotoUrl && cambios.fotoUrl.startsWith('data:')) {
      const base64Data = cambios.fotoUrl.split(',')[1];
      const mimeType = cambios.fotoUrl.split(',')[0].split(':')[1].split(';')[0];
      const blob = this.base64ToBlob(base64Data, mimeType);
      formData.append('imagen', blob, 'imagen.jpg');
    }

    return this.apiService.putFormData<RecuerdoMapaItem>(`/recuerdos-mapa/${id}`, formData);
  }

  eliminarRecuerdoMapa(id: number): Observable<void> {
    return this.apiService.delete<void>(`/recuerdos-mapa/${id}`);
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}
