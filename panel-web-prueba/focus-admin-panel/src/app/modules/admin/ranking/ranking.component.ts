import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RankingService,
  RankingCycle,
  GlobalRankingEntry,
  RankingHistory,
  CloseRankingResult,
  CreateCycleDto
} from '../../../core/services/ranking.service';
import { AuthService } from '../../../core/services/auth.service';
 
type Tab = 'current' | 'history' | 'cycles';
 
@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  activeTab = signal<Tab>('current');
 
  // Ciclo activo
  activeCycle    = signal<RankingCycle | null>(null);
  loadingCycle   = signal(true);
  noCycle        = signal(false);
 
  // Ranking global
  globalRanking  = signal<GlobalRankingEntry[]>([]);
  loadingGlobal  = signal(true);
  errorGlobal    = signal('');
  globalOffset   = signal(0);
  hasMoreGlobal  = signal(true);
  readonly GLOBAL_LIMIT = 50;
 
  // Historial
  cycles         = signal<RankingCycle[]>([]);
  history        = signal<RankingHistory[]>([]);
  loadingHistory = signal(false);
  errorHistory   = signal('');
  selectedCycleId = signal<number | null>(null);
  histOffset     = signal(0);
  hasMoreHist    = signal(true);
  readonly HIST_LIMIT = 50;
 
  // Cerrar ciclo
  showCloseModal  = signal(false);
  closeLoading    = signal(false);
  closeError      = signal('');
  closeResult     = signal<CloseRankingResult | null>(null);
 
  // Crear ciclo
  showCreateModal = signal(false);
  createLoading   = signal(false);
  createError     = signal('');
  createForm      = { start_date: '', end_date: '' };
 
  constructor(
    private rankingService: RankingService,
    private auth: AuthService
  ) {}
 
  ngOnInit() {
    this.loadActiveCycle();
    this.loadGlobalRanking();
    this.loadCycles();
  }
 
  setTab(tab: Tab) { this.activeTab.set(tab); }
 
  // ── CICLO ACTIVO ────────────────────────────────────────
  loadActiveCycle() {
    this.loadingCycle.set(true);
    this.noCycle.set(false);
    this.rankingService.getActiveCycle().subscribe({
      next: (cycle: RankingCycle) => { this.activeCycle.set(cycle); this.loadingCycle.set(false); },
      error: (err: any) => {
        this.loadingCycle.set(false);
        if (err.status === 404) { this.noCycle.set(true); this.activeCycle.set(null); }
      }
    });
  }
 
  // ── RANKING GLOBAL ──────────────────────────────────────
  loadGlobalRanking(reset = false) {
    if (reset) this.globalOffset.set(0);
    this.loadingGlobal.set(true);
    this.rankingService.getGlobalRanking(this.GLOBAL_LIMIT, this.globalOffset()).subscribe({
      next: (data: GlobalRankingEntry[]) => {
        this.globalRanking.set(data);
        this.hasMoreGlobal.set(data.length === this.GLOBAL_LIMIT);
        this.loadingGlobal.set(false);
      },
      error: (err: any) => { this.errorGlobal.set(this.auth.extractErrorMessage(err)); this.loadingGlobal.set(false); }
    });
  }
 
  globalNextPage() { this.globalOffset.set(this.globalOffset() + this.GLOBAL_LIMIT); this.loadGlobalRanking(); }
  globalPrevPage() { this.globalOffset.set(Math.max(0, this.globalOffset() - this.GLOBAL_LIMIT)); this.loadGlobalRanking(); }
  globalPage = computed(() => Math.floor(this.globalOffset() / this.GLOBAL_LIMIT) + 1);
 
  // ── CICLOS ──────────────────────────────────────────────
  loadCycles() {
    this.rankingService.getCycles().subscribe({
      next: (data: RankingCycle[]) => this.cycles.set(data),
      error: () => {}
    });
  }
 
  // ── HISTORIAL ───────────────────────────────────────────
  loadHistory(reset = false) {
    if (reset) this.histOffset.set(0);
    this.loadingHistory.set(true);
    this.errorHistory.set('');
    const cycleId = this.selectedCycleId() ?? undefined;
    this.rankingService.getHistory(cycleId, this.HIST_LIMIT, this.histOffset()).subscribe({
      next: (data: RankingHistory[]) => {
        this.history.set(data);
        this.hasMoreHist.set(data.length === this.HIST_LIMIT);
        this.loadingHistory.set(false);
      },
      error: (err: any) => { this.errorHistory.set(this.auth.extractErrorMessage(err)); this.loadingHistory.set(false); }
    });
  }
 
  filterHistByCycle(id: number | null) {
    this.selectedCycleId.set(id);
    this.loadHistory(true);
  }
 
  histNextPage() { this.histOffset.set(this.histOffset() + this.HIST_LIMIT); this.loadHistory(); }
  histPrevPage() { this.histOffset.set(Math.max(0, this.histOffset() - this.HIST_LIMIT)); this.loadHistory(); }
  histPage = computed(() => Math.floor(this.histOffset() / this.HIST_LIMIT) + 1);
 
  // ── CERRAR CICLO ────────────────────────────────────────
  openCloseModal() { this.showCloseModal.set(true); this.closeError.set(''); this.closeResult.set(null); }
  closeCloseModal() { this.showCloseModal.set(false); }
 
  confirmCloseCycle() {
    this.closeLoading.set(true);
    this.closeError.set('');
    this.rankingService.closeCycle().subscribe({
      next: (result: CloseRankingResult) => {
        this.closeLoading.set(false);
        this.closeResult.set(result);
        this.loadActiveCycle();
        this.loadGlobalRanking(true);
        this.loadCycles();
      },
      error: (err: any) => { this.closeLoading.set(false); this.closeError.set(this.auth.extractErrorMessage(err)); }
    });
  }
 
  // ── CREAR CICLO ─────────────────────────────────────────
  openCreateModal() { this.showCreateModal.set(true); this.createError.set(''); this.createForm = { start_date: '', end_date: '' }; }
  closeCreateModal() { this.showCreateModal.set(false); }
 
  confirmCreateCycle() {
    this.createLoading.set(true);
    this.createError.set('');
    this.rankingService.createCycle(this.createForm as CreateCycleDto).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreateModal();
        this.loadActiveCycle();
        this.loadCycles();
      },
      error: (err: any) => { this.createLoading.set(false); this.createError.set(this.auth.extractErrorMessage(err)); }
    });
  }
 
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
 
  formatDateTime(d: string): string {
    return new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}