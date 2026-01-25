import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PreguntasComponent } from '../preguntas/preguntas.component';
import { CommonModule } from '@angular/common';
import { ConversacionesService } from '../service/ConversacionesService';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pregunta-tema',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FormsModule],
  templateUrl: './pregunta-tema.component.html',
  styleUrl: './pregunta-tema.component.css'
})
export class PreguntaTemaComponent implements OnInit {
  respuesta: string = '';

   conversacion: any;


  constructor(
    private route: ActivatedRoute,
    private convService: ConversacionesService,
      private router: Router

  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.conversacion = this.convService.getConversacionPorId(id);
    console.log(this.conversacion); // 👈 para ver si carga correctamente
  }
  preguntas = [
  { titulo: 'Sueños y metas', emoji: '🌙', texto: '¿Hay un sueño que aún no le hayas contado a nadie?' },

  { titulo: 'Sueños y metas', emoji: '🌙', texto: '¿Qué te gustaría vivir conmigo sin prisas?'},

  { titulo: 'Sueños y metas', emoji: '🌙', texto:  'Cuando piensas en el futuro, ¿qué imagen te hace sonreír?' },

  { titulo: 'Sueños y metas', emoji: '🌙', texto: 'Si miras tu vida dentro de unos años, ¿qué te gustaría reconocer en ti?' },

  { titulo: 'Sueños y metas', emoji: '🌙', texto: '¿Qué te gustaría aprender solo por ilusión, no por obligación?' },

  { titulo: 'Sueños y metas', emoji: '🌙', texto: '¿Hay algún lugar donde te imagines conmigo?' },

  { titulo: 'Sueños y metas', emoji: '🌙', texto: '¿Qué meta pequeña te haría sentir que vas por buen camino?' },
  { titulo: 'Sueños y metas', emoji: '🌙', texto: 'Si pudieras pedir un deseo para nosotros, ¿cuál sería?' }

];

  indicePregunta = 0;

  get preguntaActual() {
    return this.preguntas[this.indicePregunta];
  }

 anteriorPregunta() {
  if (this.indicePregunta > 0) {
    this.indicePregunta--;
    this.respuesta = '';
  }
}

siguientePregunta() {
  if (this.indicePregunta < this.preguntas.length - 1) {
    this.indicePregunta++;
    this.respuesta = '';
  }
}
irAlInicio() {
  this.indicePregunta = 0;
  this.respuesta = '';
}

irAlFinal() {
  this.indicePregunta = this.preguntas.length - 1;
  this.respuesta = '';
}

 enviarRespuesta() {
    if (!this.respuesta || !this.respuesta.trim()) return;

    console.log('Respuesta enviada:', this.respuesta);
    this.respuesta = '';
  }
enviarTodo() {
  if (!this.respuesta || !this.respuesta.trim()) return;

  // De momento solo mostramos en consola
  console.log('Todas las preguntas respondidas');

  // Aquí en el futuro:
  // - guardar respuestas
  // - enviar al backend

  // Navegar a la pantalla de preguntas
  this.router.navigate(['/preguntas']);
}

}
