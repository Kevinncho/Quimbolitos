import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  alias?: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  biografia?: string;
  fotoPerfil?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  usuario: UsuarioResponse;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  alias?: string;
  email: string;
  rol: string;
  fotoPerfil?: string;
  fechaNacimiento: string;
  biografia?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<UsuarioResponse | null>(this.getUserFromStorage());
  readonly user$ = this.userSubject.asObservable();

  constructor(private apiService: ApiService) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUser(user: UsuarioResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): UsuarioResponse | null {
    return this.userSubject.value;
  }

  refreshCurrentUser(): Observable<UsuarioResponse> {
    return this.apiService.get<UsuarioResponse>('/usuarios/me').pipe(
      tap((user) => this.saveUser(user))
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  resolveFotoPerfilUrl(fotoPerfil?: string): string {
    const path = fotoPerfil?.trim();
    if (!path) {
      return '/assets/Berserk.jpg';
    }
    return this.apiService.getAssetUrl(path) || '/assets/Berserk.jpg';
  }

  private getUserFromStorage(): UsuarioResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
