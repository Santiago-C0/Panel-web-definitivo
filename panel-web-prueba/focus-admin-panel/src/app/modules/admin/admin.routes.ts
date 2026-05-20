import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./users/users-list/users-list.component').then(m => m.UsersListComponent)
  },
  {
    path: 'users/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];