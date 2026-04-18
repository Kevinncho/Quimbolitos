import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../app/service/api.service';
import { AuthService } from '../../../app/service/auth.service';
import { MensajeRecuerdoResponse, RecuerdoResponse, RecuerdoService } from '../../../app/service/recuerdo.service';

@Component({
  selector: 'app-detalle-recuerdo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-recuerdo.component.html',
  styleUrl: './detalle-recuerdo.component.css'
})
export class DetalleRecuerdoComponent implements OnInit {
  recuerdo: RecuerdoResponse | null = null;
  comentarios: MensajeRecuerdoResponse[] = [];
  mensajesVisibles: MensajeRecuerdoResponse[] = [];
  visibleCount = 30;
  cargandoMensajes = false;
  errorMensajes = '';

  nuevoMensaje: string = '';
  usuarioActual = '';
  autoScrollActivo = true;

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recuerdoService: RecuerdoService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  cerrarDetalle() {
    this.router.navigate(['/diario']);
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const user = this.authService.getUser();
    this.usuarioActual = user?.nombre || '';

    if (!id) {
      this.router.navigate(['/diario']);
      return;
    }

    this.recuerdoService.getRecuerdoById(id).subscribe({
      next: (recuerdo) => {
        this.recuerdo = recuerdo;
      },
      error: () => {
        this.router.navigate(['/diario']);
      }
    });

    this.cargandoMensajes = true;
    this.errorMensajes = '';
    this.recuerdoService.getMensajes(id).subscribe({
      next: (mensajes) => {
        this.comentarios = mensajes;
        this.cargandoMensajes = false;
        this.actualizarMensajesVisibles();
        this.scrollToBottom();
      },
      error: () => {
        this.cargandoMensajes = false;
        this.errorMensajes = 'Todavia no hay mensajes en este recuerdo.';
      }
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    if (!this.recuerdo) return;

    const contenido = this.nuevoMensaje.trim();
    this.nuevoMensaje = '';

    this.recuerdoService.crearMensaje(this.recuerdo.id, contenido).subscribe({
      next: (mensaje) => {
        this.comentarios = [...this.comentarios, mensaje];
        this.actualizarMensajesVisibles();
        this.scrollToBottom();
      }
    });
  }

  getImagenRecuerdo(): string {
    if (this.recuerdo?.fotoUrl) {
      return this.apiService.getAssetUrl(this.recuerdo.fotoUrl);
    }
    return '/assets/Recuerdo1.jpeg';
  }

  getAvatarMensaje(mensaje: MensajeRecuerdoResponse): string {
    if (mensaje.usuarioFotoPerfil) {
      return this.apiService.getAssetUrl(mensaje.usuarioFotoPerfil);
    }
    return '/assets/sinuser.svg';
  }

  getAvatarAutorRecuerdo(): string {
    if (this.recuerdo?.usuarioFotoPerfil) {
      return this.apiService.getAssetUrl(this.recuerdo.usuarioFotoPerfil);
    }
    return '/assets/sinuser.svg';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        if (this.autoScrollActivo) {
          this.chatContainer.nativeElement.scrollTop =
            this.chatContainer.nativeElement.scrollHeight;
        }
      }
    }, 50);
  }

  onChatScroll(): void {
    const el = this.chatContainer?.nativeElement;
    if (!el) {
      return;
    }
    const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.autoScrollActivo = distancia < 40;
  }

  cargarMensajesAnteriores(): void {
    this.visibleCount = Math.min(this.visibleCount + 30, this.comentarios.length);
    this.actualizarMensajesVisibles();
  }

  private actualizarMensajesVisibles(): void {
    const total = this.comentarios.length;
    const start = Math.max(0, total - this.visibleCount);
    this.mensajesVisibles = this.comentarios.slice(start);
  }
}
