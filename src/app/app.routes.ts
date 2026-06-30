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
        data: {
          title: 'Iniciar Inventário',
          description:
            'Importação de planilha Excel e abertura de inventários de contagem.',
          stage: 'Etapa 4',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
          ),
      },
      {
        path: 'contadores',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: {
          title: 'Cadastrar Contadores',
          description: 'Cadastro da equipe de contadores e vínculo a inventários.',
          stage: 'Etapa 5',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
          ),
      },
      {
        path: 'acompanhamento',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: {
          title: 'Acompanhamento',
          description: 'Painel de progresso do inventário em tempo real.',
          stage: 'Etapa 8',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
          ),
      },
      {
        path: 'contagem',
        data: {
          title: 'Contagem',
          description:
            'Tela do contador: o sistema entrega as posições a contar automaticamente.',
          stage: 'Etapa 7',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
          ),
      },
      {
        path: 'resultados',
        canActivate: [roleGuard(UserRole.ADMIN)],
        data: {
          title: 'Resultados',
          description: 'Relatórios de inventário, divergências e exportações.',
          stage: 'Etapa 9',
        },
        loadComponent: () =>
          import('./shared/components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent
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
