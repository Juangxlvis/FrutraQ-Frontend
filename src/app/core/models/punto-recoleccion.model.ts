export interface PuntoRecoleccion {
  id: string;
  viaje: string;
  proveedor: string;
  orden: number;
  tipo_servicio: 'COMPRA' | 'FLETE';
  precio_flete_kg: string | null;
}