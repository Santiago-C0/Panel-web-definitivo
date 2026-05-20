import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSummary {
  id_user: number;
  username: string;
  name: string;
  lastname: string;
  email: string;
  phone: string | null;
  active: boolean;
  foints_season: number;
  foints_total: number;
  created_at: string;
}

export interface UserActivity {
  id_task: number;
  task_name: string;
  scheduled_date: string;
  completed_at: string;
  foints_earned: number;
  id_task_template: number;
}

export interface UsersListParams {
  activos?: boolean | null;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityParams {
  limit?: number;
  offset?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: UsersListParams = {}): Observable<UserSummary[]> {
    let httpParams = new HttpParams();
    if (params.activos !== null && params.activos !== undefined) {
      httpParams = httpParams.set('activos', String(params.activos));
    }
    if (params.q)      httpParams = httpParams.set('q', params.q);
    if (params.limit)  httpParams = httpParams.set('limit', String(params.limit));
    if (params.offset !== undefined) httpParams = httpParams.set('offset', String(params.offset));
    return this.http.get<UserSummary[]>(this.base, { params: httpParams });
  }

  getUser(id: number): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.base}/${id}`);
  }

  getActivity(id: number, params: ActivityParams = {}): Observable<UserActivity[]> {
    let httpParams = new HttpParams();
    if (params.limit)  httpParams = httpParams.set('limit', String(params.limit));
    if (params.offset !== undefined) httpParams = httpParams.set('offset', String(params.offset));
    return this.http.get<UserActivity[]>(`${this.base}/${id}/activity`, { params: httpParams });
  }

  banUser(id: number): Observable<UserSummary> {
    return this.http.post<UserSummary>(`${this.base}/${id}/ban`, {});
  }

  unbanUser(id: number): Observable<UserSummary> {
    return this.http.post<UserSummary>(`${this.base}/${id}/unban`, {});
  }
}
