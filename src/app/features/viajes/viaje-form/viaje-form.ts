import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ViajeService } from '../viaje.service';

@Component({
  selector: 'app-viaje-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatButtonToggleModule, MatDatepickerModule],
  templateUrl: './viaje-form.html',
  styleUrl: './viaje-form.scss',
})
export class ViajeForm {
  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    fecha_salida: [new Date(), Validators.required],
    vehiculo: ['TURBO', Validators.required],
    observaciones: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const valores = this.form.getRawValue();
    const fecha = valores.fecha_salida as Date;

    this.viajeService.crear({
      fecha_salida: this.formatFecha(fecha), // formato local, no UTC — evita el corrimiento de un día
      vehiculo: valores.vehiculo!,
      observaciones: valores.observaciones ?? '',
    }).subscribe({
      next: (viaje) => this.router.navigate(['/viajes', viaje.id]),
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo crear el viaje. Intenta de nuevo.');
      },
    });
  }

  private formatFecha(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}