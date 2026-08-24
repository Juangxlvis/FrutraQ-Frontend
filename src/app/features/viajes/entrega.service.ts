import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class EntregaService {
  private api = inject(ApiService);

  crearEntrega(datos: { viaje: string; cliente: string }): Observable<{ id: string }> {
    return this.api.post('entregas', datos);
  }

  crearDetalle(datos: {
    entrega: string; producto: string;
    kg_primera_recibida: number; kg_segunda_recibida: number;
  }): Observable<{ id: string; precio_primera_kg: string; precio_segunda_kg: string; subtotal: string }> {
    return this.api.post('detalles-entrega', datos);
  }
}