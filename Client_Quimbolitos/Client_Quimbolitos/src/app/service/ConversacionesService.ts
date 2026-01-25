// src/app/services/conversaciones.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConversacionesService {
    conversaciones = [
    // 👉 Esto o aquello
    {id:1, tema: 'esto-o-aquello', titulo: 'Vacaciones', emoji: '🌍' },
    { id:2, tema: 'esto-o-aquello', titulo: 'Comida y bebida', emoji: '🍽️' },
    { id:3, tema: 'esto-o-aquello', titulo: 'Amor y relación', emoji: '💞' },
    { id:4, tema: 'esto-o-aquello', titulo: 'Tiempo libre y entretenimiento', emoji: '🎬' },
    { id:5, tema: 'esto-o-aquello', titulo: 'Aventuras y experiencias', emoji: '🧭' },
    { id:6, tema: 'esto-o-aquello', titulo: 'Casa y decoración', emoji: '🏡' },

    // 👉 Románticas
    { id:7, tema: 'romanticas', titulo: 'Cita sorpresa', emoji: '🎁' },
    { id:8, tema: 'romanticas', titulo: 'Recuerdos y nostalgia', emoji: '📖' },
    { id:9, tema: 'romanticas', titulo: 'Sentimientos y emociones', emoji: '💗' },
    { id:10, tema: 'romanticas', titulo: 'Futuro juntos', emoji: '💍' },
    { id:11, tema: 'romanticas', titulo: 'Futuro juntos', emoji: '💍' },


    // 👉 Divertidas
    { id:12, tema: 'divertidas', titulo: 'Juegos y retos', emoji: '🎮' },
    { id:13, tema: 'divertidas', titulo: 'Recuerdos y anécdotas', emoji: '😂' },
    { id:14, tema: 'divertidas', titulo: 'Imaginación absurda', emoji: '🤪' },
    { id:15, tema: 'divertidas', titulo: 'Imaginación y “qué pasaría si…”', emoji: '🤯' },
    { id:16, tema: 'divertidas', titulo: 'Gustos y preferencias graciosas', emoji: '😜' },
    { id:17, tema: 'divertidas', titulo: 'Juegos y competencia', emoji: '🏆' },

    // 👉 Conversaciones profundas
    { id:18, tema: 'conversacion-profundas', titulo: 'Sueños y metas', emoji: '🌙' },
    { id:19, tema: 'conversacion-profundas', titulo: 'Familia y relaciones', emoji: '👨‍👩‍👧‍👦' },
    { id:20, tema: 'conversacion-profundas', titulo: 'Filosofía y reflexión', emoji: '🧠' },
    { id:21, tema: 'conversacion-profundas', titulo: 'Valores y creencias', emoji: '✨' },
    { id:22, tema: 'conversacion-profundas', titulo: 'Valores y creencias', emoji: '✨' },

    // 👉 Intensas
    { id:23, tema: 'intensas', titulo: 'Amor y conexión', emoji: '❤️‍🔥' },
    { id:24, tema: 'intensas', titulo: 'Sexo y fantasías', emoji: '🔥' },
    { id:25, tema: 'intensas', titulo: 'Secretos', emoji: '🗝️' },
    { id:26, tema: 'intensas', titulo: 'Vida y propósito', emoji: '🧿' },
    { id:27, tema: 'intensas', titulo: 'Vida y propósito', emoji: '🧿' },

  ];
  getConversacionPorId(id: number) {
    return this.conversaciones.find(c => c.id === id);
  }
}
