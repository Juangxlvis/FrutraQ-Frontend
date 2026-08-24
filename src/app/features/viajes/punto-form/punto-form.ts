import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Proveedor } from '../../../core/models/proveedor.model';
import { Producto } from '../../../core/models/producto.model';
import { PuntoService } from '../punto.service';
import { ViajeService } from '../viaje.service';

interface LoteStaging {
  producto: Producto;
  calidad: '1RA' | '2DA';
  num_canastillas: number;
  peso_recoleccion_kg: number;
}

@Component({
  selector: 'app-punto-form',
  imports: [
    ReactiveFormsModule, MatStepperModule, MatAutocompleteModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatButtonToggleModule, MatSelectModule, MatIconModule,
  ],
  templateUrl: './punto-form.html',
  styleUrl: './punto-form.scss',
})
export class PuntoForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private puntoService = inject(PuntoService);
  private viajeService = inject(ViajeService);

  private viajeId = this.route.snapshot.paramMap.get('id')!;

  proveedores = signal<Proveedor[]>([]);
  productos = signal<Producto[]>([]);
  guardando = signal(false);

  // Paso 1: proveedor
  proveedorControl = this.fb.control('', Validators.required);
  proveedorSeleccionado = signal<Proveedor | null>(null);

  private textoFiltro = toSignal(this.proveedorControl.valueChanges, { initialValue: '' });
  proveedoresFiltrados = computed(() => {
    const texto = (this.textoFiltro() ?? '').toString().toLowerCase();
    return this.proveedores().filter((p) => p.nombre.toLowerCase().includes(texto));
  });

  // Paso 2: tipo de servicio
  tipoForm = this.fb.group({
    tipo_servicio: ['COMPRA' as 'COMPRA' | 'FLETE', Validators.required],
    precio_flete_kg: [''],
  });

  // Paso 3: lotes (formulario "de captura", se resetea después de cada Agregar)
  loteForm = this.fb.group({
    producto: this.fb.control<Producto | null>(null, Validators.required),
    calidad: ['1RA' as '1RA' | '2DA', Validators.required],
    num_canastillas: [null as number | null, [Validators.required, Validators.min(1)]],
    peso_recoleccion_kg: [null as number | null, [Validators.required, Validators.min(0.1)]],
  });
  lotesAgregados = signal<LoteStaging[]>([]);

  private valoresLoteEnVivo = toSignal(this.loteForm.valueChanges, { initialValue: this.loteForm.value });
  pesoPromedioEnVivo = computed(() => {
    const v = this.valoresLoteEnVivo();
    const canastillas = Number(v.num_canastillas);
    const peso = Number(v.peso_recoleccion_kg);
    if (!canastillas || !peso) return null;
    return (peso / canastillas).toFixed(2);
  });

  ngOnInit(): void {
    this.proveedorService.listar().subscribe((r) => this.proveedores.set(r.results));
    this.productoService.listar().subscribe((r) => this.productos.set(r.results));
  }

  displayProveedor(proveedor: Proveedor | string): string {
    return typeof proveedor === 'string' ? proveedor : (proveedor?.nombre ?? '');
  }

  seleccionarProveedor(proveedor: Proveedor): void {
    this.proveedorSeleccionado.set(proveedor);
    this.tipoForm.patchValue({ tipo_servicio: proveedor.tipo_servicio_habitual });
  }

  agregarLote(): void {
    if (this.loteForm.invalid) return;
    const v = this.loteForm.getRawValue();
    this.lotesAgregados.update((lista) => [...lista, {
      producto: v.producto!, calidad: v.calidad!,
      num_canastillas: v.num_canastillas!, peso_recoleccion_kg: v.peso_recoleccion_kg!,
    }]);
    this.loteForm.reset({ calidad: '1RA' });
  }

  eliminarLote(index: number): void {
    this.lotesAgregados.update((lista) => lista.filter((_, i) => i !== index));
  }

  guardarParada(): void {
    if (!this.proveedorSeleccionado() || this.lotesAgregados().length === 0) return;
    this.guardando.set(true);

    this.viajeService.puntos(this.viajeId).subscribe((puntosExistentes) => {
      const siguienteOrden = puntosExistentes.length + 1;
      const tipo = this.tipoForm.value.tipo_servicio!;

      this.puntoService.crearPunto({
        viaje: this.viajeId,
        proveedor: this.proveedorSeleccionado()!.id,
        orden: siguienteOrden,
        tipo_servicio: tipo,
        precio_flete_kg: tipo === 'FLETE' ? this.tipoForm.value.precio_flete_kg! : null,
      }).subscribe({
        next: (punto) => {
          const total = this.lotesAgregados().length;
          let guardados = 0;

          this.lotesAgregados().forEach((lote) => {
            this.puntoService.crearLote({
              punto_recoleccion: punto.id,
              producto: lote.producto.id,
              calidad: lote.calidad,
              num_canastillas: lote.num_canastillas,
              peso_recoleccion_kg: lote.peso_recoleccion_kg,
            }).subscribe({
              next: () => {
                guardados++;
                if (guardados === total) this.router.navigate(['/viajes', this.viajeId]);
              },
              error: () => {
                this.guardando.set(false);
                this.snackBar.open('Error guardando uno de los lotes.', 'Cerrar', { duration: 4000 });
              },
            });
          });
        },
        error: () => {
          this.guardando.set(false);
          this.snackBar.open('No se pudo guardar la parada.', 'Cerrar', { duration: 4000 });
        },
      });
    });
  }
}