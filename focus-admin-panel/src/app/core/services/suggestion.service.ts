import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type SuggestionStatus = 'pendiente' | 'aprobada' | 'rechazada';
export type SuggestionType   = 'tarea' | 'categoria';

export interface Suggestion {
  id_suggestion: number;
  id_user: number;
  type: SuggestionType;
  content: string;
  status: SuggestionStatus;
  id_admin: number | null;
  date: string;
}

export interface SuggestionListParams {
  status?: SuggestionStatus;
  type?: SuggestionType;
  limit?: number;
  offset?: number;
}

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private base = `${environment.apiUrl}/suggestions`;

  constructor(private http: HttpClient) {}

  getSuggestions(params: SuggestionListParams = {}): Observable<Suggestion[]> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    if (params.type)   p = p.set('type',   params.type);
    if (params.limit)  p = p.set('limit',  String(params.limit));
    if (params.offset !== undefined) p = p.set('offset', String(params.offset));
    return this.http.get<Suggestion[]>(this.base, { params: p });
  }

  getSuggestion(id: number): Observable<Suggestion> {
    return this.http.get<Suggestion>(`${this.base}/${id}`);
  }

  reviewSuggestion(id: number, status: 'aprobada' | 'rechazada'): Observable<Suggestion> {
    return this.http.patch<Suggestion>(`${this.base}/${id}/review`, { status });
  }
}