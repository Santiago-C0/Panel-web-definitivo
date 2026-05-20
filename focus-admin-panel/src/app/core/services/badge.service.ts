import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Badge {
  id_badge: number;
  name: string;
  description: string;
  image_url: string | null;
  min_position: number;
  max_position: number;
}

export interface BadgeRecipient {
  id_user_badge: number;
  id_user: number;
  id_badge: number;
  cycle_start_date: string;
  cycle_end_date: string;
  position_obtained: number;
}

export interface CreateBadgeDto {
  name: string;
  description: string;
  image_url?: string;
  min_position: number;
  max_position: number;
}

export interface PatchBadgeDto {
  name?: string;
  description?: string;
  image_url?: string;
  min_position?: number;
  max_position?: number;
}

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private base = `${environment.apiUrl}/admin/badges`;

  constructor(private http: HttpClient) {}

  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.base);
  }

  createBadge(dto: CreateBadgeDto): Observable<Badge> {
    return this.http.post<Badge>(this.base, dto);
  }

  updateBadge(id: number, dto: PatchBadgeDto): Observable<Badge> {
    return this.http.patch<Badge>(`${this.base}/${id}`, dto);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getRecipients(id: number, limit = 50, offset = 0): Observable<BadgeRecipient[]> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));
    return this.http.get<BadgeRecipient[]>(`${this.base}/${id}/recipients`, { params });
  }

  getUserBadges(userId: number): Observable<BadgeRecipient[]> {
    return this.http.get<BadgeRecipient[]>(
      `${environment.apiUrl}/admin/users/${userId}/badges`
    );
  }
}