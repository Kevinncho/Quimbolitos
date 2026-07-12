import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBaseUrl } from '../config/api.config';
import { getStoredToken } from './auth-storage';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = getApiBaseUrl();

  constructor(private http: HttpClient) {}

  private getHeaders(endpoint?: string): HttpHeaders {
    const token = getStoredToken();

    if (endpoint?.includes('/auth')) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = getStoredToken();
    return new HttpHeaders({
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

post<T>(endpoint: string, data: any): Observable<T> {
  const isFormData = data instanceof FormData;
  const token = getStoredToken();

  return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
    headers: isFormData
      ? new HttpHeaders({
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
        })
      : this.getHeaders(endpoint)
  });
}

postFormData<T>(endpoint: string, data: FormData): Observable<T> {
  const token = getStoredToken();

  return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
    headers: new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    })
  });
}

  putFormData<T>(endpoint: string, data: FormData): Observable<T> {
    const token = getStoredToken();

    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAssetUrl(path: string): string {
    if (!path) {
      return path;
    }
    const trimmed = path.trim();
    if (!trimmed) {
      return trimmed;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('assets/')) {
      return `/${trimmed}`;
    }
    if (trimmed.startsWith('/assets/')) {
      return `${this.baseUrl.replace(/\/api$/, '')}${trimmed}`;
    }
    if (trimmed.startsWith('/')) {
      return `${this.baseUrl.replace(/\/api$/, '')}${trimmed}`;
    }
    return trimmed;
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}
