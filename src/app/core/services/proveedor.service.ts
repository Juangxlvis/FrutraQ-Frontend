import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Proveedor } from '../models/proveedor.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private api = inject(ApiService);
  listar(): Observable<PaginatedResponse<Proveedor>> {
    return this.api.get<PaginatedResponse<Proveedor>>('proveedores');
  }
}