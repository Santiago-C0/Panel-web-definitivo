import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService, UserSummary } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';

type FilterState = 'all' | 'active' | 'banned';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users       = signal<UserSummary[]>([]);
  loading    = signal(true);
  error      = signal('');
  actionError = signal('');

  // Filtros
  searchQuery  = signal('');
  filterState  = signal<FilterState>('all');
  searchInput  = '';
  selectedFilter: FilterState = 'all';

  // Paginación
  readonly LIMIT = 30;
  offset = signal(0);
  hasMore = signal(true);

  // Modal
  modalAction  = signal<'ban' | 'unban' | null>(null);
  modalUser    = signal<UserSummary | null>(null);
  modalLoading = signal(false);

  // Selector de página actual calculado automáticamente
  currentPage = computed(() => Math.floor(this.offset() / this.LIMIT) + 1);

  constructor(
    private usersService: UsersService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() { 
    this.loadUsers(); 
  }

  loadUsers(resetOffset = false) {
    if (resetOffset) this.offset.set(0);
    this.loading.set(true);
    this.error.set('');

    const activos =
      this.filterState() === 'active'  ? true  :
      this.filterState() === 'banned'  ? false :
      null;

    this.usersService.getUsers({
      activos,
      q: this.searchQuery() || undefined,
      limit: this.LIMIT,
      offset: this.offset()
    }).subscribe({
      //
      next: (data: UserSummary[]) => {
        this.users.set(data);
        this.hasMore.set(data.length === this.LIMIT);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(this.auth.extractErrorMessage(err, 'Error al cargar usuarios.'));
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.searchQuery.set(this.searchInput);
    this.loadUsers(true);
  }

  onFilterChange() {
    this.filterState.set(this.selectedFilter);
    this.loadUsers(true);
  }

  clearSearch() {
    this.searchInput = '';
    this.searchQuery.set('');
    this.loadUsers(true);
  }

  nextPage() {
    this.offset.set(this.offset() + this.LIMIT);
    this.loadUsers();
  }

  prevPage() {
    this.offset.set(Math.max(0, this.offset() - this.LIMIT));
    this.loadUsers();
  }

  viewDetail(id: number) {
    this.router.navigate(['/admin/users', id]);
  }

  openModal(action: 'ban' | 'unban', user: UserSummary) {
    this.modalAction.set(action);
    this.modalUser.set(user);
    this.actionError.set('');
  }

  closeModal() {
    this.modalAction.set(null);
    this.modalUser.set(null);
    this.actionError.set('');
  }

  confirmAction() {
    const user = this.modalUser();
    const action = this.modalAction();
    if (!user || !action) return;

    this.modalLoading.set(true);
    this.actionError.set('');

    const req$ = action === 'ban'
      ? this.usersService.banUser(user.id_user)
      : this.usersService.unbanUser(user.id_user);

    // CORRECCIÓN 2: Tipado estricto y lógica de actualización optimizada
    req$.subscribe({
      next: (updated: UserSummary) => {
        this.modalLoading.set(false);
        this.closeModal();
        
        // Si tienes un filtro activo (ej: 'active' o 'banned'), lo ideal es remover al usuario de la lista 
        // para que la interfaz sea coherente, o actualizarlo si estás viendo 'all'.
        if (this.filterState() !== 'all') {
          this.users.update(list => list.filter(u => u.id_user !== updated.id_user));
        } else {
          this.users.update(list =>
            list.map(u => u.id_user === updated.id_user ? { ...u, active: updated.active } : u)
          );
        }
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.actionError.set(this.auth.extractErrorMessage(err, 'No se pudo completar la acción.'));
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}