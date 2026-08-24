export type EstadoViaje = 'RECOLECCION' | 'TRANSITO' | 'ENTREGADO' | 'CANCELADO';
export type Vehiculo = 'TURBO' | 'CAMION';

export interface Viaje {
  id: string;
  fecha_salida: string;
  vehiculo: Vehiculo;
  estado: EstadoViaje;
  observaciones: string;
  creado_en: string;
  actualizado_en: string;
  total_recolectado_kg: number;
  total_entregado: string; // string a propósito — recuerda el fix de formato de dinero del backend
}

export interface ViajeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Viaje[];
}