import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BadgeService,
  Badge,
  BadgeRecipient,
  CreateBadgeDto,
  PatchBadgeDto
} from '../../../core/services/badge.service';
import { AuthService } from '../../../core/services/auth.service';

type ModalMode = 'create' | 'edit' | 'delete' | 'recipients' | null;

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.css']
})
export class BadgesComponent implements OnInit {
  badges        = signal<Badge[]>([]);
  loading       = signal(true);
  error         = signal('');

  modalMode     = signal<ModalMode>(null);
  modalLoading  = signal(false);
  modalError    = signal('');
  selectedBadge = signal<Badge | null>(null);

  recipients        = signal<BadgeRecipient[]>([]);
  loadingRecipients = signal(false);
  errorRecipients   = signal('');

  readonly LIMIT = 50;
  recipientsOffset = signal(0);
  hasMoreRecipients = signal(true);

  form: CreateBadgeDto = {
    name: '',
    description: '',
    image_url: '',
    min_position: 1,
    max_position: 1
  };

  constructor(
    private badgeService: BadgeService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadBadges();
  }

  loadBadges() {
    this.loading.set(true);
    this.error.set('');
    this.badgeService.getBadges().subscribe({
      next: (data: Badge[]) => {
        this.badges.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(this.auth.extractErrorMessage(err, 'No se pudieron cargar los badges.'));
        this.loading.set(false);
      }
    });
  }

  hasOverlap(excludeId?: number): boolean {
    const others = this.badges().filter(b => b.id_badge !== excludeId);
    return others.some(
      b => this.form.min_position <= b.max_position &&
           this.form.max_position >= b.min_position
    );
  }

  // ── MODALES ────────────────────────────────────────────

  openCreate() {
    this.form = { name: '', description: '', image_url: '', min_position: 1, max_position: 1 };
    this.modalError.set('');
    this.modalMode.set('create');
  }

  openEdit(badge: Badge) {
    this.form = {
      name:         badge.name,
      description:  badge.description,
      image_url:    badge.image_url ?? '',
      min_position: badge.min_position,
      max_position: badge.max_position
    };
    this.selectedBadge.set(badge);
    this.modalError.set('');
    this.modalMode.set('edit');
  }

  openDelete(badge: Badge) {
    this.selectedBadge.set(badge);
    this.modalError.set('');
    this.modalMode.set('delete');
  }

  openRecipients(badge: Badge) {
    this.selectedBadge.set(badge);
    this.recipients.set([]);
    this.recipientsOffset.set(0);
    this.hasMoreRecipients.set(true);
    this.errorRecipients.set('');
    this.modalMode.set('recipients');
    this.loadRecipients();
  }

  closeModal() {
    this.modalMode.set(null);
    this.selectedBadge.set(null);
    this.modalError.set('');
    this.modalLoading.set(false);
  }

  // ── SUBMIT ─────────────────────────────────────────────

  submitForm() {
    if (!this.form.name.trim()) {
      this.modalError.set('El nombre es obligatorio.');
      return;
    }
    if (this.form.min_position > this.form.max_position) {
      this.modalError.set('La posición mínima no puede ser mayor que la máxima.');
      return;
    }

    const isEdit    = this.modalMode() === 'edit';
    const selected  = this.selectedBadge();
    const excludeId = isEdit && selected ? selected.id_badge : undefined;

    if (this.hasOverlap(excludeId)) {
      this.modalError.set('⚠ El rango se solapa con otro badge existente. Puedes continuar, pero el sistema asignará el primer badge que coincida.');
    }

    this.modalLoading.set(true);

    const dto: PatchBadgeDto = {
      name:         this.form.name,
      description:  this.form.description,
      image_url:    this.form.image_url || undefined,
      min_position: Number(this.form.min_position),
      max_position: Number(this.form.max_position)
    };

    const req$ = isEdit && selected
      ? this.badgeService.updateBadge(selected.id_badge, dto)
      : this.badgeService.createBadge(dto as CreateBadgeDto);

    req$.subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadBadges();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo guardar el badge.'));
      }
    });
  }

  confirmDelete() {
    const badge = this.selectedBadge();
    if (!badge) return;
    this.modalLoading.set(true);
    this.modalError.set('');
    this.badgeService.deleteBadge(badge.id_badge).subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadBadges();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        const msg = err?.status === 400
          ? 'No se puede eliminar: este badge ya fue otorgado a usuarios. El historial debe preservarse.'
          : this.auth.extractErrorMessage(err, 'No se pudo eliminar el badge.');
        this.modalError.set(msg);
      }
    });
  }

  // ── RECIPIENTS ─────────────────────────────────────────

  loadRecipients() {
    const badge = this.selectedBadge();
    if (!badge) return;
    this.loadingRecipients.set(true);
    this.errorRecipients.set('');
    this.badgeService.getRecipients(badge.id_badge, this.LIMIT, this.recipientsOffset()).subscribe({
      next: (data: BadgeRecipient[]) => {
        this.recipients.set(data);
        this.hasMoreRecipients.set(data.length === this.LIMIT);
        this.loadingRecipients.set(false);
      },
      error: (err: any) => {
        this.errorRecipients.set(this.auth.extractErrorMessage(err, 'No se pudieron cargar los destinatarios.'));
        this.loadingRecipients.set(false);
      }
    });
  }

  recipientsPage = () => Math.floor(this.recipientsOffset() / this.LIMIT) + 1;

  nextRecipientsPage() {
    this.recipientsOffset.set(this.recipientsOffset() + this.LIMIT);
    this.loadRecipients();
  }

  prevRecipientsPage() {
    this.recipientsOffset.set(Math.max(0, this.recipientsOffset() - this.LIMIT));
    this.loadRecipients();
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}