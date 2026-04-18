import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

interface NominatimResponse {
  address?: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    hamlet?: string;
  };
}

export interface UbicacionGeocodificada {
  pais: string;
  ciudad: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  // Consulta Nominatim para convertir coordenadas en pais y ciudad.
  reverseGeocode(lat: number, lng: number): Observable<UbicacionGeocodificada> {
    const params = new HttpParams()
      .set('lat', lat)
      .set('lon', lng)
      .set('format', 'json')
      .set('addressdetails', '1');

    return this.http.get<NominatimResponse>(this.nominatimUrl, { params }).pipe(
      map((response) => {
        const address = response.address ?? {};

        return {
          pais: address.country ?? '',
          ciudad:
            address.city ??
            address.town ??
            address.village ??
            address.municipality ??
            address.hamlet ??
            ''
        };
      })
    );
  }
}
