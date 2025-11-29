import { Routes, withRouterConfig } from '@angular/router';
import { LoginComponent } from './login/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } 
];
