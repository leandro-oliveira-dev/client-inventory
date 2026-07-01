import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './core/models/user.model';

/**
 * Rotas da aplicação.
 *
 * - `/login`: tela pública de autenticação.
 * - Demais rotas ficam sob o `MainLayoutComponent` (sidebar + header) e são
 *   protegidas pelo `authGuard`. Rotas administrativas usam ainda o
 *   `roleGuard(ADMIN)`. O `data.title` alimenta o título do header e o
 *   `data.description`/`stage` alimentam as telas placeholder das próximas etapas.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: { title: 'Dashboard' },
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'inventario',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: { title: 'Iniciar Inventário' },
        loadComponent: () =>
          import('./modules/inventario/inventario.component').then(
            (m) => m.InventarioComponent
          ),
      },
      {
        path: 'contadores',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: { title: 'Cadastrar Contadores' },
        loadComponent: () =>
          import('./modules/contadores/contadores.component').then(
            (m) => m.ContadoresComponent
          ),
      },
      {
        path: 'acompanhamento',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: { title: 'Acompanhamento' },
        loadComponent: () =>
          import('./modules/acompanhamento/acompanhamento.component').then(
            (m) => m.AcompanhamentoComponent
          ),
      },
      {
        path: 'contagem',
        data: { title: 'Contagem' },
        loadComponent: () =>
          import('./modules/contagem/contagem.component').then(
            (m) => m.ContagemComponent
          ),
      },
      {
        path: 'resultados',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: { title: 'Resultados' },
        loadComponent: () =>
          import('./modules/resultados/resultados.component').then(
            (m) => m.ResultadosComponent
          ),
      },
      {
        path: 'assinatura',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: {
          title: 'Assinatura Digital',
          description: 'Geração e assinatura digital do documento final em PDF.',
          stage: 'Etapa 10',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
