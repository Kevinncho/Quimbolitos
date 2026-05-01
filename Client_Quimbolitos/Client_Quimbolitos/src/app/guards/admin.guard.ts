import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.authService.isLoggedIn()) {
      return of(this.router.createUrlTree(['/login']));
    }

    return this.authService.refreshCurrentUser().pipe(
      map((user) => user.rol === 'ADMIN' ? true : this.router.createUrlTree(['/inicio'])),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
