import { Routes, withRouterConfig } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { HeaderComponent } from './header/header.component';
import { PreguntaTemaComponent } from './pregunta-tema/pregunta-tema.component';
import { JuegosComponent } from './juegos/juegos.component';
import { AhorcadoComponent } from './juegos/ahorcado/ahorcado.component';
import { DiarioComponent } from '../diario/diario.component';
import { MapaComponent } from '../diario/mapa/mapa.component';
import { DetalleRecuerdoComponent } from '../diario/recuerdos/detalle-recuerdo/detalle-recuerdo.component';
import { CrearRecuerdoComponent } from '../diario/recuerdos/crear-recuerdo/crear-recuerdo.component';
import { CrearMemoriaMapaComponent } from '../diario/mapa/crear-memoria-mapa/crear-memoria-mapa.component';
import { RecuerdosMapaComponent } from '../diario/mapa/recuerdos-mapa/recuerdos-mapa.component';
import { DetalleBitacoraComponent } from '../diario/mapa/detalle-bitacora/detalle-bitacora.component';
import { PlaylistComponent } from '../diario/playlist/playlist/playlist.component';
import { CrearCancionComponent } from '../diario/playlist/crear-cancion/crear-cancion.component';
import { CrearTemaComponent } from './crear-tema/crear-tema.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { EditarPerfilComponent } from './mi-perfil/editar-perfil.component';
import { RegistroComponent } from './login/registro/registro.component';
import { CrearPreguntaAdminComponent } from './crear-pregunta-admin/crear-pregunta-admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'preguntas', component: PreguntasComponent, canActivate: [AuthGuard] },
  { path: 'header', component: HeaderComponent, canActivate: [AuthGuard] },
  { path: 'crear-tema', component: CrearTemaComponent, canActivate: [AuthGuard] },
  { path: 'pregunta_tema/:id', component: PreguntaTemaComponent, canActivate: [AuthGuard] },
  { path: 'admin/crear-pregunta', component: CrearPreguntaAdminComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'juegos', component: JuegosComponent, canActivate: [AuthGuard] },
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [AuthGuard] },
  { path: 'mi-perfil/editar', component: EditarPerfilComponent, canActivate: [AuthGuard] },
  { path: 'ahorcado', component: AhorcadoComponent, canActivate: [AuthGuard] },
  { path: 'diario', component: DiarioComponent, canActivate: [AuthGuard] },
  { path: 'diario/mapa', component: MapaComponent, canActivate: [AuthGuard] },
  { path: 'diario/mapa/crear-memoria', component: CrearMemoriaMapaComponent, canActivate: [AuthGuard] },
  { path: 'diario/mapa/bitacora', component: RecuerdosMapaComponent, canActivate: [AuthGuard] },
  { path: 'diario/mapa/bitacora/:id', component: DetalleBitacoraComponent, canActivate: [AuthGuard] },
  { path: 'diario/recuerdo/:id', component: DetalleRecuerdoComponent, canActivate: [AuthGuard] },
  { path: 'diario/crear-recuerdo', component: CrearRecuerdoComponent, canActivate: [AuthGuard] },
  { path: 'playlist', component: PlaylistComponent, canActivate: [AuthGuard] },
  { path: 'playlist/crear-cancion', component: CrearCancionComponent, canActivate: [AuthGuard] }
];
