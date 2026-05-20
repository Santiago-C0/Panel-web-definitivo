import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id_user: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  phone: string | null;
  birth_date: string;
  profile_picture: string | null;
  description: string | null;
  private_profile: boolean;
  foints_season: number;
  foints_total: number;
  id_role: number;
  created_at: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'focus_admin_token';
  private readonly USER_KEY = 'focus_admin_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<UserProfile> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http
      .post<{ access_token: string; token_type: string }>(
        `${environment.apiUrl}/auth/login`,
        body.toString(),
        { headers }
      )
      .pipe(
        tap(res => this.saveToken(res.access_token)),
        switchMap(() => this.fetchProfile())
      );
  }

  fetchProfile(): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${environment.apiUrl}/auth/me`)
      .pipe(
        switchMap(user => {
          if (user.id_role !== 1) {
            this.clearSession();
            return throwError(() => ({ accessDenied: true }));
          }
          this.saveUser(user);
          return [user];
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Extrae el mensaje de error de la API (campo `detail`) */
  extractErrorMessage(err: any, fallback = 'Error inesperado'): string {
    if (err?.accessDenied) {
      return 'Acceso denegado. Solo administradores pueden ingresar.';
    }
    if (err?.error?.detail) {
      return typeof err.error.detail === 'string'
        ? err.error.detail
        : JSON.stringify(err.error.detail);
    }
    if (err?.status === 401) return 'Credenciales incorrectas.';
    if (err?.status === 0)   return 'No se pudo conectar con el servidor.';
    return fallback;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private saveUser(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
