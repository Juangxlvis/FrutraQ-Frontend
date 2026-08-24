import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { ViajeService } from '../viaje.service';
import { Viaje } from '../../../core/models/viaje.model';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { RouterLink } from '@angular/router';

type Filtro = 'TODOS' | 'EN_CURSO' | 'ENTREGADOS' | 'CANCELADOS';

@Component({
  selector: 'app-viaje-list',
  imports: [MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, EmptyState, RouterLink],
  templateUrl: './viaje-list.html',
  styleUrl: './viaje-list.scss',
})
export class ViajeList implements OnInit {
  private viajeService = inject(ViajeService);

  loading = signal(true);
  error = signal(false);
  viajes = signal<Viaje[]>([]);
  filtro = signal<Filtro>('TODOS');

  viajeActivo = computed(() =>
    this.viajes().find((v) => v.estado === 'RECOLECCION' || v.estado === 'TRANSITO')
  );

  viajesFiltrados = computed(() => {
    const f = this.filtro();
    const lista = this.viajes();
    if (f === 'TODOS') return lista;
    if (f === 'EN_CURSO') return lista.filter((v) => v.estado === 'RECOLECCION' || v.estado === 'TRANSITO');
    if (f === 'ENTREGADOS') return lista.filter((v) => v.estado === 'ENTREGADO');
    return lista.filter((v) => v.estado === 'CANCELADO');
  });

  ngOnInit(): void {
    this.viajeService.listar().subscribe({
      next: (respuesta) => {
        this.viajes.set(respuesta.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}