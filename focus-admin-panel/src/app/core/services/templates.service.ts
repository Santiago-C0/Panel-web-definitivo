import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
 
export interface Category {
  id_category: number;
  category_name: string;
  category_description: string;
}
 
export interface TaskTemplate {
  id_task_template: number;
  id_category: number;
  name: string;
  description: string;
  foints_base: number;
  active: boolean;
}
 
export interface CreateCategoryDto {
  category_name: string;
  category_description: string;
}
 
export interface CreateTemplateDto {
  id_category: number;
  name: string;
  description: string;
  foints_base: number;
  active: boolean;
}
 
export interface PatchTemplateDto {
  id_category?: number;
  name?: string;
  description?: string;
  foints_base?: number;
  active?: boolean;
}
 
@Injectable({ providedIn: 'root' })
export class TemplatesService {
  private catBase = `${environment.apiUrl}/categories`;
  private tplBase = `${environment.apiUrl}/templates`;
 
  constructor(private http: HttpClient) {}
 
  // ── CATEGORIES ──────────────────────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.catBase);
  }
 
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.catBase}/${id}`);
  }
 
  createCategory(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.catBase, dto);
  }
 
  updateCategory(id: number, dto: Partial<CreateCategoryDto>): Observable<Category> {
    return this.http.patch<Category>(`${this.catBase}/${id}`, dto);
  }
 
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.catBase}/${id}`);
  }
 
  // ── TEMPLATES ───────────────────────────────────────────
  getTemplates(id_category?: number): Observable<TaskTemplate[]> {
    let params = new HttpParams();
    if (id_category !== undefined) params = params.set('id_category', String(id_category));
    return this.http.get<TaskTemplate[]>(`${this.tplBase}/all`, { params });
  }
 
  getTemplate(id: number): Observable<TaskTemplate> {
    return this.http.get<TaskTemplate>(`${this.tplBase}/${id}`);
  }
 
  createTemplate(dto: CreateTemplateDto): Observable<TaskTemplate> {
    return this.http.post<TaskTemplate>(this.tplBase, dto);
  }
 
  updateTemplate(id: number, dto: PatchTemplateDto): Observable<TaskTemplate> {
    return this.http.patch<TaskTemplate>(`${this.tplBase}/${id}`, dto);
  }
 
  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tplBase}/${id}`);
  }
}