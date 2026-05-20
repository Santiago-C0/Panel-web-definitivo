import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () => import('./users/users-list/users-list.component').then(m => m.UsersListComponent)
  },
  {
    path: 'users/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
  },
  {
    path: 'ranking',
    canActivate: [adminGuard],
    loadComponent: () => import('./ranking/ranking.component').then(m => m.RankingComponent)
  },
  {
    path: 'templates',
    canActivate: [adminGuard],
    loadComponent: () => import('./templates/templates.component').then(m => m.TemplatesComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'badges',
    canActivate: [adminGuard],
    loadComponent: () =>
    import('./badges/badges.component').then(m => m.BadgesComponent)
  },
  {
    path: 'suggestions',
    canActivate: [adminGuard],
    loadComponent: () =>
    import('./suggestions/suggestions.component').then(m => m.SuggestionsComponent)
  },
];