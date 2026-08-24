export interface Proveedor {
  id: string;
  nombre: string;
  vereda: string;
  municipio: string;
  telefono: string;
  tipo_servicio_habitual: 'COMPRA' | 'FLETE';
  activo: boolean;
  notas: string;
}