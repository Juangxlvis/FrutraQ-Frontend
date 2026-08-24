import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../models/producto.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = inject(ApiService);
  listar(): Observable<PaginatedResponse<Producto>> {
    return this.api.get<PaginatedResponse<Producto>>('productos');
  }
}