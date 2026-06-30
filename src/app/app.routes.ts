import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Rotas da aplicação.
 *
 * - `/login`: tela pública de autenticação.
 * - `/home`: tela inicial protegida pelo `authGuard` (exige sessão ativa).
 * Rotas desconhecidas redirecionam para o login.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
