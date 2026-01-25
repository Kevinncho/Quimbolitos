import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
imports: [FormsModule]

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule,HeaderComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent implements OnInit{
  mostrarInput: boolean = false;
  respuesta: string = '';
ngOnInit(): void {
  this.obtenerDistancia();
   const guardado = localStorage.getItem('mensajeRefugio');
  if (guardado) {
    this.mensajeRefugio = guardado;
  } else {
    this.editando = true;
  }
}
  mostrarCaja() {
    this.mostrarInput = true;
  }

  ocultarCaja() {
    this.mostrarInput = false;
    this.respuesta = ''; // limpiar input
  }

  enviarRespuesta() {
    alert(`Tu respuesta: ${this.respuesta}`);
    this.respuesta = '';
    this.mostrarInput = false;
  }

  estados = [
    { usuario: 'Thalia', estado: 'Feliz', emoji: '😊' },
    { usuario: 'Kevin', estado: 'Cansado', emoji: '😴' }
  ];

  listaEmojis = ['😊', '😂', '😢', '😴', '😡', '😍'];
  mostrarSelectorEmoji: boolean[] = [];

  emojiEstadoMap: { [key: string]: string } = {
  '😊': 'Feliz',
  '😂': 'Contento',
  '😢': 'Triste',
  '😴': 'Cansado',
  '😡': 'Enojado',
  '😍': 'Enamorado'
};
emojiColorMap: { [key: string]: string } = {
  '😊': 'emoji-feliz',
  '😂': 'emoji-contento',
  '😢': 'emoji-triste',
  '😴': 'emoji-cansado',
  '😡': 'emoji-enojado',
  '😍': 'emoji-enamorado'
};


  constructor() {
    // Inicializamos el array de visibilidad en false
    this.mostrarSelectorEmoji = this.estados.map(() => false);
  }

  toggleEmojiSelector(index: number) {
    this.mostrarSelectorEmoji[index] = !this.mostrarSelectorEmoji[index];
  }

  seleccionarEmoji(index: number, emoji: string) {
  this.estados[index].emoji = emoji;

  // 🔥 Actualizar estado automáticamente
  this.estados[index].estado = this.emojiEstadoMap[emoji] || 'Neutral';

  this.mostrarSelectorEmoji[index] = false;
}

calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = this.deg2rad(lat2 - lat1);
  const dLon = this.deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) *
    Math.cos(this.deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

deg2rad(grados: number): number {
  return grados * (Math.PI / 180);
}
distanciaKm: number | null = null;

obtenerDistancia() {
  navigator.geolocation.getCurrentPosition((pos) => {
    const latUsuario = pos.coords.latitude;
    const lonUsuario = pos.coords.longitude;

    // 📌 Coordenadas fijas (ejemplo)
    const latThalia = -12.0464;
    const lonThalia = -77.0428;

    this.distanciaKm = this.calcularDistancia(
      latUsuario,
      lonUsuario,
      latThalia,
      lonThalia
    );
  });
}
mensajeRefugio: string = '';
editando = false;


guardarMensaje() {
  localStorage.setItem('mensajeRefugio', this.mensajeRefugio);
  this.editando = false;
}

abriendoLlave = false;
mostrarMensaje = false;

abrirLlave() {
  if (this.abriendoLlave) return;

  this.abriendoLlave = true;

  // El mensaje aparece DESPUÉS de que la llave "se abra"
  setTimeout(() => {
    this.mostrarMensaje = true;
  }, 900); // coincide con la animación
}
}
