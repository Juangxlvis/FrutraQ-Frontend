import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Producto } from '../../../core/models/producto.model';
import { EntregaService } from '../entrega.service';

interface DetalleGuardado {
  producto: Producto;
  kg_primera_recibida: number;
  kg_segunda_recibida: number;
  subtotal: string;
}

@Component({
  selector: 'app-entrega-form',
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule],
  templateUrl: './entrega-form.html',
  styleUrl: './entrega-form.scss',
})
export class EntregaForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private entregaService = inject(EntregaService);

  private viajeId = this.route.snapshot.paramMap.get('id')!;

  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  guardando = signal(false);
  entregaId = signal<string | null>(null);

  clienteControl = this.fb.control('', Validators.required);
  clienteSeleccionado = signal<Cliente | null>(null);

  private textoFiltro = toSignal(this.clienteControl.valueChanges, { initialValue: '' });
  clientesFiltrados = computed(() => {
    const texto = (this.textoFiltro() ?? '').toString().toLowerCase();
    return this.clientes().filter((c) => c.nombre.toLowerCase().includes(texto));
  });

  detalleForm = this.fb.group({
    producto: this.fb.control<Producto | null>(null, Validators.required),
    kg_primera_recibida: [0, [Validators.min(0)]],
    kg_segunda_recibida: [0, [Validators.min(0)]],
  });
  detallesGuardados = signal<DetalleGuardado[]>([]);
  totalEntrega = computed(() =>
    this.detallesGuardados().reduce((suma, d) => suma + Number(d.subtotal), 0)
  );

  ngOnInit(): void {
    this.clienteService.listar().subscribe((r) => this.clientes.set(r.results));
    this.productoService.listar().subscribe((r) => this.productos.set(r.results));
  }

  displayCliente(cliente: Cliente | string): string {
    return typeof cliente === 'string' ? cliente : (cliente?.nombre ?? '');
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado.set(cliente);
    this.guardando.set(true);
    this.entregaService.crearEntrega({ viaje: this.viajeId, cliente: cliente.id }).subscribe({
      next: (entrega) => { this.entregaId.set(entrega.id); this.guardando.set(false); },
      error: () => {
        this.guardando.set(false);
        this.snackBar.open('No se pudo iniciar la entrega.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  agregarDetalle(): void {
    if (this.detalleForm.invalid || !this.entregaId()) return;
    const v = this.detalleForm.getRawValue();
    if (!v.kg_primera_recibida && !v.kg_segunda_recibida) {
      this.snackBar.open('Ingresa al menos kg de primera o de segunda.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.entregaService.crearDetalle({
      entrega: this.entregaId()!,
      producto: v.producto!.id,
      kg_primera_recibida: v.kg_primera_recibida!,
      kg_segunda_recibida: v.kg_segunda_recibida!,
    }).subscribe({
      next: (respuesta) => {
        this.detallesGuardados.update((lista) => [...lista, {
          producto: v.producto!,
          kg_primera_recibida: v.kg_primera_recibida!,
          kg_segunda_recibida: v.kg_segunda_recibida!,
          subtotal: respuesta.subtotal,
        }]);
        this.detalleForm.reset({ kg_primera_recibida: 0, kg_segunda_recibida: 0 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.[0] ?? err.error?.non_field_errors?.[0] ?? 'No se pudo agregar el detalle. ¿Hay precio configurado para este cliente y producto?', 'Cerrar', { duration: 5000 });
      },
    });
  }

  finalizar(): void {
    this.router.navigate(['/viajes', this.viajeId]);
  }
}