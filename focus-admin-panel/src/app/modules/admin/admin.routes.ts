import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./ranking/ranking.component').then(m => m.RankingComponent)
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./templates/templates.component').then(m => m.TemplatesComponent)
      },
      {
        path: 'badges',
        loadComponent: () =>
          import('./badges/badges.component').then(m => m.BadgesComponent)
      },
      {
        path: 'suggestions',
        loadComponent: () =>
          import('./suggestions/suggestions.component').then(m => m.SuggestionsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
