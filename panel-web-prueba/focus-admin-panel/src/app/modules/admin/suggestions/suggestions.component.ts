import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SuggestionService,
  Suggestion,
  SuggestionStatus,
  SuggestionType
} from '../../../core/services/suggestion.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit {
  suggestions   = signal<Suggestion[]>([]);
  loading       = signal(true);
  error         = signal('');

  selectedStatus = signal<SuggestionStatus | ''>('');
  selectedType   = signal<SuggestionType | ''>('');

  readonly LIMIT = 30;
  offset    = signal(0);
  hasMore   = signal(true);
  currentPage = computed(() => Math.floor(this.offset() / this.LIMIT) + 1);

  modalSuggestion = signal<Suggestion | null>(null);
  modalLoading    = signal(false);
  modalError      = signal('');

  constructor(
    private suggestionService: SuggestionService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadSuggestions();
  }

  loadSuggestions(resetOffset = false) {
    if (resetOffset) this.offset.set(0);
    this.loading.set(true);
    this.error.set('');

    this.suggestionService.getSuggestions({
      status: this.selectedStatus() || undefined,
      type:   this.selectedType()   || undefined,
      limit:  this.LIMIT,
      offset: this.offset()
    }).subscribe({
      next: (data: Suggestion[]) => {
        this.suggestions.set(data);
        this.hasMore.set(data.length === this.LIMIT);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(this.auth.extractErrorMessage(err, 'No se pudieron cargar las sugerencias.'));
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.loadSuggestions(true);
  }

  nextPage() { this.offset.set(this.offset() + this.LIMIT); this.loadSuggestions(); }
  prevPage() { this.offset.set(Math.max(0, this.offset() - this.LIMIT)); this.loadSuggestions(); }

  openDetail(s: Suggestion) {
    this.modalSuggestion.set(s);
    this.modalError.set('');
  }

  closeModal() {
    this.modalSuggestion.set(null);
    this.modalError.set('');
    this.modalLoading.set(false);
  }

  review(status: 'aprobada' | 'rechazada') {
    const s = this.modalSuggestion();
    if (!s) return;
    this.modalLoading.set(true);
    this.modalError.set('');
    this.suggestionService.reviewSuggestion(s.id_suggestion, status).subscribe({
      next: (updated: Suggestion) => {
        this.modalLoading.set(false);
        this.suggestions.update(list =>
          list.map(x => x.id_suggestion === updated.id_suggestion ? updated : x)
        );
        this.modalSuggestion.set(updated);
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo procesar la sugerencia.'));
      }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  statusLabel(s: SuggestionStatus): string {
    return { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' }[s];
  }

  typeLabel(t: SuggestionType): string {
    return { tarea: 'Plantilla de tarea', categoria: 'Categoría' }[t];
  }
}