import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule,HeaderComponent],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit {


palabraSecreta = '';
  pista = '';

  palabraVisible: string[] = [];
  errores = 0;

  letrasUsadas: string[] = [];
  maxErrores = 6;

  juegoTerminado = false;
  mensajeFinal = '';


  constructor(private router: Router) {}

ngOnInit() {
  const state = history.state as any;

  if (!state?.palabra) {
    this.router.navigate(['/juegos']);
    return;
    
  }

  this.palabraSecreta = state.palabra;
  this.pista = state.pista || '';

  this.palabraVisible = Array(this.palabraSecreta.length).fill('_');

  // Capturar teclado real
  window.addEventListener('keydown', (event) => {
    const letra = event.key.toUpperCase();

    // Solo letras A-Z
    if (letra >= 'A' && letra <= 'Z') {
      this.jugarLetra(letra);
    }
  });
}

  jugarLetra(letra: string) {
    if (this.juegoTerminado) return;
    if (this.letrasUsadas.includes(letra)) return;

    this.letrasUsadas.push(letra);

    // Si la letra NO está en la palabra, sumamos error
    if (!this.palabraSecreta.includes(letra)) {
      this.errores++;

      if (this.errores >= this.maxErrores) {
        this.juegoTerminado = true;
        this.mensajeFinal = `Perdiste 😢. La palabra era: ${this.palabraSecreta}`;
      }
      return;
    }

    // Si está, reemplazamos los "_" por la letra
    for (let i = 0; i < this.palabraSecreta.length; i++) {
      if (this.palabraSecreta[i] === letra) {
        this.palabraVisible[i] = letra;
      }
    }

    // Revisamos si ya ganó
    if (!this.palabraVisible.includes('_')) {
      this.juegoTerminado = true;
      this.mensajeFinal = '¡Ganaste! 🎉';
    }
  }

  reiniciar() {
    this.errores = 0;
    this.letrasUsadas = [];
    this.juegoTerminado = false;
    this.mensajeFinal = '';
    this.palabraVisible = Array(this.palabraSecreta.length).fill('_');
  }

  volverAJuegos() {
    this.router.navigate(['/juegos']);
  }
}
