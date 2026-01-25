import { Routes, withRouterConfig } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { HeaderComponent } from './header/header.component';
import { PreguntaTemaComponent } from './pregunta-tema/pregunta-tema.component';
import { JuegosComponent } from './juegos/juegos.component';
import { AhorcadoComponent } from './juegos/ahorcado/ahorcado.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } ,
  { path: 'inicio', component: InicioComponent},
  { path: 'preguntas', component: PreguntasComponent},
  { path: 'header', component: HeaderComponent},

  { path: 'pregunta_tema/:id', component: PreguntaTemaComponent },
    { path: 'juegos', component: JuegosComponent },
    {path:'ahorcado', component: AhorcadoComponent}


];
