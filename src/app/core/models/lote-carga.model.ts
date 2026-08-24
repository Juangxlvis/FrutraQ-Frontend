export interface LoteCarga {
  id: string;
  punto_recoleccion: string;
  producto: string;
  calidad: '1RA' | '2DA';
  num_canastillas: number;
  peso_recoleccion_kg: string;
}