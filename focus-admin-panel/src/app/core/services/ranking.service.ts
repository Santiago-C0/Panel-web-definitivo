import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
 
export interface RankingCycle {
  id_cycle: number;
  start_date: string;
  end_date: string;
  closed: boolean;
  closed_at: string | null;
}
 
export interface CloseRankingResult {
  message: string;
  id_cycle: number;
  total_usuarios_rankeados: number;
  badges_otorgados: number;
}
 
export interface RankingHistory {
  id_history: number;
  id_user: number;
  id_cycle: number;
  global_position: number;
  foints_cycle: number;
}
 
export interface GlobalRankingEntry {
  position: number;
  id_user: number;
  username: string;
  name: string;
  lastname: string;
  profile_picture: string | null;
  foints_season: number;
}
 
export interface CreateCycleDto {
  start_date: string;
  end_date: string;
}
 
@Injectable({ providedIn: 'root' })
export class RankingService {
  private base = `${environment.apiUrl}/ranking`;
 
  constructor(private http: HttpClient) {}
 
  getActiveCycle(): Observable<RankingCycle> {
    return this.http.get<RankingCycle>(`${this.base}/cycles/active`);
  }
 
  getCycles(solo_cerrados = false): Observable<RankingCycle[]> {
    const params = new HttpParams().set('solo_cerrados', String(solo_cerrados));
    return this.http.get<RankingCycle[]>(`${this.base}/cycles`, { params });
  }
 
  createCycle(dto: CreateCycleDto): Observable<RankingCycle> {
    return this.http.post<RankingCycle>(`${this.base}/cycles`, dto);
  }
 
  closeCycle(): Observable<CloseRankingResult> {
    return this.http.post<CloseRankingResult>(`${this.base}/cycles/close`, {});
  }
 
  getHistory(id_cycle?: number, limit = 50, offset = 0): Observable<RankingHistory[]> {
    let params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));
    if (id_cycle !== undefined) params = params.set('id_cycle', String(id_cycle));
    return this.http.get<RankingHistory[]>(`${this.base}/history`, { params });
  }
 
  getGlobalRanking(limit = 50, offset = 0): Observable<GlobalRankingEntry[]> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));
    return this.http.get<GlobalRankingEntry[]>(`${this.base}/global`, { params });
  }
}