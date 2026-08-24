import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError } from 'rxjs';
import { ApiService } from './api.service';

interface TokenResponse {
  access: string;
  refresh: string;
}

const ACCESS_KEY = 'frutraq_access_token';
const REFRESH_KEY = 'frutraq_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal<boolean>(!!localStorage.getItem(ACCESS_KEY));

  constructor(private api: ApiService, private router: Router) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('token', { username, password }).pipe(
      tap((tokens) => {
        localStorage.setItem(ACCESS_KEY, tokens.access);
        localStorage.setItem(REFRESH_KEY, tokens.refresh);
        this.isAuthenticated.set(true);
      })
    );
  }

  refreshToken(): Observable<string> {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      return throwError(() => new Error('No hay refresh token disponible.'));
    }
    return this.api.post<{ access: string }>('token/refresh', { refresh }).pipe(
      map((respuesta) => {
        localStorage.setItem(ACCESS_KEY, respuesta.access);
        return respuesta.access;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }
}