import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Shell } from './shell/shell';
import { authGuard } from './core/guards/auth.guard';
import { ViajeList } from './features/viajes/viaje-list/viaje-list';
import { ViajeForm } from './features/viajes/viaje-form/viaje-form';
import { ViajeDetail } from './features/viajes/viaje-detail/viaje-detail';
import { PuntoForm } from './features/viajes/punto-form/punto-form';
import { EntregaForm } from './features/viajes/entrega-form/entrega-form';


export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'viajes', component: ViajeList },
      { path: 'viajes/crear', component: ViajeForm },
      { path: 'viajes/:id', component: ViajeDetail },
      { path: '', redirectTo: 'viajes', pathMatch: 'full' },
      { path: 'viajes/:id/puntos/nuevo', component: PuntoForm },
      { path: 'viajes/:id/entregas/nueva', component: EntregaForm },
    ],
  },
];