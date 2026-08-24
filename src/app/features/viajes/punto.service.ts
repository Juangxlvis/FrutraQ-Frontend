import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { LoteCarga } from '../../core/models/lote-carga.model';

@Injectable({ providedIn: 'root' })
export class PuntoService {
  private api = inject(ApiService);

  crearPunto(datos: {
    viaje: string; proveedor: string; orden: number;
    tipo_servicio: 'COMPRA' | 'FLETE'; precio_flete_kg: string | null;
  }): Observable<{ id: string }> {
    return this.api.post('puntos-recoleccion', datos);
  }

  crearLote(datos: {
    punto_recoleccion: string; producto: string; calidad: '1RA' | '2DA';
    num_canastillas: number; peso_recoleccion_kg: number;
  }): Observable<{ id: string }> {
    return this.api.post('lotes-carga', datos);
  }

  listarLotes(puntoId: string): Observable<LoteCarga[]> {
  return this.api.get<LoteCarga[]>(`puntos-recoleccion/${puntoId}/lotes`);
  }
}