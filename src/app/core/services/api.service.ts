import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  get<T>(path: string, params: Record<string, string> = {}): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}/`, { params: new HttpParams({ fromObject: params }) });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}/`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${path}/`, body);
  }
}