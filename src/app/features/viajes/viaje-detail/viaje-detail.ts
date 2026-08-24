import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { ViajeService } from '../viaje.service';
import { Viaje } from '../../../core/models/viaje.model';
import { PuntoRecoleccion } from '../../../core/models/punto-recoleccion.model';
import { Entrega } from '../../../core/models/entrega.model';
import { PuntoService } from '../punto.service';
import { LoteCarga } from '../../../core/models/lote-carga.model';
import { ProductoService } from '../../../core/services/producto.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { Producto } from '../../../core/models/producto.model';
import { Proveedor } from '../../../core/models/proveedor.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-viaje-detail',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, RouterLink],
  templateUrl: './viaje-detail.html',
  styleUrl: './viaje-detail.scss',
})
export class ViajeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private viajeService = inject(ViajeService);
  private snackBar = inject(MatSnackBar);
  private puntoService = inject(PuntoService);
  private productoService = inject(ProductoService);
  private proveedorService = inject(ProveedorService);

  private clienteService = inject(ClienteService);

  private viajeId = this.route.snapshot.paramMap.get('id')!;

  loading = signal(true);
  viaje = signal<Viaje | null>(null);
  puntos = signal<PuntoRecoleccion[]>([]);
  entregas = signal<Entrega[]>([]);
  cambiandoEstado = signal(false);
  expandido = signal<string | null>(null);
  lotesPorPunto = signal<Record<string, LoteCarga[]>>({});
  productos = signal<Producto[]>([]);
  proveedores = signal<Proveedor[]>([]);
  clientes = signal<Cliente[]>([]);

  ngOnInit(): void {
    this.viajeService.obtener(this.viajeId).subscribe((v) => {
      this.viaje.set(v);
      this.loading.set(false);
    });
    this.viajeService.puntos(this.viajeId).subscribe((p) => this.puntos.set(p));
    this.viajeService.entregas(this.viajeId).subscribe((e) => this.entregas.set(e));
    this.productoService.listar().subscribe((r) => this.productos.set(r.results));
    this.proveedorService.listar().subscribe((r) => this.proveedores.set(r.results));
  }

  marcarTransito(): void { this.cambiarEstado(this.viajeService.marcarTransito(this.viajeId)); }
  marcarEntregado(): void { this.cambiarEstado(this.viajeService.marcarEntregado(this.viajeId)); }

  private cambiarEstado(peticion: ReturnType<ViajeService['marcarTransito']>): void {
    this.cambiandoEstado.set(true);
    peticion.subscribe({
      next: (v) => { this.viaje.set(v); this.cambiandoEstado.set(false); },
      error: (err) => {
        this.cambiandoEstado.set(false);
        this.snackBar.open(err.error?.detail ?? 'No se pudo cambiar el estado.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  toggleParada(puntoId: string): void {
    if (this.expandido() === puntoId) {
      this.expandido.set(null);
      return;
    }
    this.expandido.set(puntoId);
    if (!this.lotesPorPunto()[puntoId]) {
      this.puntoService.listarLotes(puntoId).subscribe((lotes) => {
        this.lotesPorPunto.update((m) => ({ ...m, [puntoId]: lotes }));
      });
    }
  }

  nombreProducto(id: string): string {
    return this.productos().find((p) => p.id === id)?.nombre ?? this.idCorto(id);
  }

  nombreProveedor(id: string): string {
    return this.proveedores().find((p) => p.id === id)?.nombre ?? this.idCorto(id);
  }

  etiquetaCalidad(calidad: string): string {
    return calidad === '1RA' ? 'Primera' : 'Segunda';
  }

  idCorto(id: string): string { return id.slice(0, 8); }

  nombreCliente(id: string): string {
  return this.clientes().find((c) => c.id === id)?.nombre ?? this.idCorto(id);
}
}