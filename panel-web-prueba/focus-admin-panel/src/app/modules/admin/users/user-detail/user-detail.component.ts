import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, UserSummary, UserActivity } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user         = signal<UserSummary | null>(null);
  activity     = signal<UserActivity[]>([]);
  loadingUser  = signal(true);
  loadingAct   = signal(true);
  errorUser    = signal('');
  errorAct     = signal('');
  actionError  = signal('');

  // Paginación actividad
  readonly ACT_LIMIT = 50;
  actOffset    = signal(0);
  hasMoreAct   = signal(true);

  // Modal
  modalAction  = signal<'ban' | 'unban' | null>(null);
  modalLoading = signal(false);

  userId!: number;

  // Optimización: cambiamos el "get" por un "computed" reactivo para Signals
  actPage = computed(() => Math.floor(this.actOffset() / this.ACT_LIMIT) + 1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
    this.loadActivity();
  }

  loadUser() {
    this.loadingUser.set(true);
    this.usersService.getUser(this.userId).subscribe({
      // Agregado: Tipado explícito para el usuario único recibido
      next: (u: UserSummary) => { 
        this.user.set(u); 
        this.loadingUser.set(false); 
      },
      error: (err: any) => {
        this.errorUser.set(this.auth.extractErrorMessage(err, 'No se pudo cargar el usuario.'));
        this.loadingUser.set(false);
      }
    });
  }

  loadActivity(resetOffset = false) {
    if (resetOffset) this.actOffset.set(0);
    this.loadingAct.set(true);
    this.usersService.getActivity(this.userId, {
      limit: this.ACT_LIMIT,
      offset: this.actOffset()
    }).subscribe({
      // Agregado: Tipado explícito para la lista de actividades recibida
      next: (data: UserActivity[]) => {
        this.activity.set(data);
        this.hasMoreAct.set(data.length === this.ACT_LIMIT);
        this.loadingAct.set(false);
      },
      error: (err: any) => {
        this.errorAct.set(this.auth.extractErrorMessage(err, 'No se pudo cargar la actividad.'));
        this.loadingAct.set(false);
      }
    });
  }

  nextActPage() { 
    this.actOffset.set(this.actOffset() + this.ACT_LIMIT); 
    this.loadActivity(); 
  }
  
  prevActPage() { 
    this.actOffset.set(Math.max(0, this.actOffset() - this.ACT_LIMIT)); 
    this.loadActivity(); 
  }

  openModal(action: 'ban' | 'unban') {
    this.modalAction.set(action);
    this.actionError.set('');
  }

  closeModal() {
    this.modalAction.set(null);
    this.actionError.set('');
  }

  confirmAction() {
    const action = this.modalAction();
    if (!action) return;
    this.modalLoading.set(true);
    this.actionError.set('');

    const req$ = action === 'ban'
      ? this.usersService.banUser(this.userId)
      : this.usersService.unbanUser(this.userId);

    req$.subscribe({
      // Agregado: Tipado explícito para el usuario actualizado tras la acción
      next: (updated: UserSummary) => {
        this.user.set(updated);
        this.modalLoading.set(false);
        this.closeModal();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.actionError.set(this.auth.extractErrorMessage(err, 'No se pudo completar la acción.'));
      }
    });
  }

  goBack() { 
    this.router.navigate(['/users']); 
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}  