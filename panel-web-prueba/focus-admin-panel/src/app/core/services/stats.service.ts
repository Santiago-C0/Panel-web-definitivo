import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  usuarios_activos: number;
  usuarios_baneados: number;
  tareas_totales: number;
  tareas_completadas: number;
  tareas_completadas_hoy: number;
  foints_distribuidos_total: number;
  foints_distribuidos_ciclo_actual: number;
  ciclo_activo: boolean;
  id_ciclo_activo: number | null;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`);
  }
}
