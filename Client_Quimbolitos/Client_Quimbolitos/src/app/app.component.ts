import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { JuegoNotificacionService } from './service/juego-notificacion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Client_Quimbolitos';
  toastMensaje = '';
  mostrarToast = false;
  private toastSub: Subscription | null = null;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private juegoNotificacionService: JuegoNotificacionService) {}

  ngOnInit(): void {
    this.toastSub = this.juegoNotificacionService.toast$.subscribe((mensaje) => {
      this.toastMensaje = mensaje;
      this.mostrarToast = true;
      if (this.toastTimeoutId) {
        clearTimeout(this.toastTimeoutId);
      }
      this.toastTimeoutId = setTimeout(() => {
        this.mostrarToast = false;
      }, 7000);
    });
  }

  ngOnDestroy(): void {
    this.toastSub?.unsubscribe();
    this.toastSub = null;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }
}
