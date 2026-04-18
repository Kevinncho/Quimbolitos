import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../app/service/api.service';
import { MapaMemoriaService, RecuerdoMapaItem } from '../../../app/service/mapa-memoria.service';

@Component({
  selector: 'app-detalle-bitacora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-bitacora.component.html',
  styleUrl: './detalle-bitacora.component.css'
})
export class DetalleBitacoraComponent implements OnInit {
  recuerdo: RecuerdoMapaItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memoriaService: MapaMemoriaService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/diario/mapa/bitacora']);
      return;
    }

    this.memoriaService.getRecuerdoMapaById(id).subscribe({
      next: (recuerdo) => {
        this.recuerdo = recuerdo;
      },
      error: () => {
        this.router.navigate(['/diario/mapa/bitacora']);
      }
    });
  }

  cerrarDetalle(): void {
    this.router.navigate(['/diario/mapa/bitacora']);
  }

  getImagenRecuerdo(): string {
    if (this.recuerdo?.fotoUrl) {
      return this.apiService.getAssetUrl(this.recuerdo.fotoUrl);
    }
    return '/assets/Recuerdo1.jpeg';
  }

  getAvatarAutor(): string {
    if (this.recuerdo?.usuarioFotoPerfil) {
      return this.apiService.getAssetUrl(this.recuerdo.usuarioFotoPerfil);
    }
    return '/assets/sinuser.svg';
  }
}
