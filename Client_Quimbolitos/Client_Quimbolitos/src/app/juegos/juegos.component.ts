import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule,HeaderComponent],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent {
  constructor(private router: Router) {}

  iniciarJuego(palabra: string, pista: string) {
    if (!palabra.trim()) return;

   this.router.navigate(['/ahorcado'], {
  state: {
    palabra: palabra.toUpperCase(),
    pista: pista
  }
});
  }
}
