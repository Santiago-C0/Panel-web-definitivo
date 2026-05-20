import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, AdminStats } from '../../../core/services/stats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set('');
    this.statsService.getStats().subscribe({
      next: data => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas.');
        this.loading.set(false);
      }
    });
  }
}
