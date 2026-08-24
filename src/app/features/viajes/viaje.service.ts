import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Viaje, ViajeListResponse } from '../../core/models/viaje.model';
import { PuntoRecoleccion } from '../../core/models/punto-recoleccion.model';
import { Entrega } from '../../core/models/entrega.model';

@Injectable({ providedIn: 'root' })
export class ViajeService {
  private api = inject(ApiService);

  listar(): Observable<ViajeListResponse> {
    return this.api.get<ViajeListResponse>('viajes');
  }

  obtener(id: string): Observable<Viaje> {
    return this.api.get<Viaje>(`viajes/${id}`);
  }

  crear(datos: { fecha_salida: string; vehiculo: string; observaciones?: string }): Observable<Viaje> {
    return this.api.post<Viaje>('viajes', datos);
  }

  puntos(id: string): Observable<PuntoRecoleccion[]> {
    return this.api.get<PuntoRecoleccion[]>(`viajes/${id}/puntos`);
  }

  entregas(id: string): Observable<Entrega[]> {
    return this.api.get<Entrega[]>(`viajes/${id}/entregas`);
  }

  marcarTransito(id: string): Observable<Viaje> {
    return this.api.post<Viaje>(`viajes/${id}/marcar-transito`, {});
  }

  marcarEntregado(id: string): Observable<Viaje> {
    return this.api.post<Viaje>(`viajes/${id}/marcar-entregado`, {});
  }
}