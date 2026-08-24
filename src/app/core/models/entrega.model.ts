export interface Entrega {
  id: string;
  viaje: string;
  cliente: string;
  fecha_entrega: string;
  estado_pago: 'PENDIENTE' | 'PAGADO';
  notas: string;
  creado_en: string;
  total: string;
}