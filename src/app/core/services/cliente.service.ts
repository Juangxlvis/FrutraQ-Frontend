import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cliente } from '../models/cliente.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private api = inject(ApiService);
  listar(): Observable<PaginatedResponse<Cliente>> {
    return this.api.get<PaginatedResponse<Cliente>>('clientes');
  }
}