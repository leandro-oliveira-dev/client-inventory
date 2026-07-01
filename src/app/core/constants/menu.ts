/**
 * Definição dos itens do menu lateral.
 *
 * Cada item declara os papéis que podem visualizá-lo, permitindo que a
 * navegação se adapte automaticamente ao usuário autenticado (integração com
 * o controle de acesso da Parte 2). Os ícones são armazenados como trechos
 * de `path` SVG, renderizados pelo componente de sidebar.
 */

import { UserRole } from '../models/user.model';

/** Representa um item de navegação do menu lateral. */
export interface MenuItem {
  /** Rótulo exibido ao usuário. */
  label: string;
  /** Rota de destino (absoluta). */
  route: string;
  /** Trechos `d` de `<path>` SVG que compõem o ícone (viewBox 0 0 24 24). */
  icon: string[];
  /** Papéis autorizados a ver/usar o item. */
  roles: UserRole[];
}

/** Atalho com os dois papéis (item visível para todos). */
const ALL: UserRole[] = [UserRole.ADMIN, UserRole.CONTADOR];

/**
 * Itens do menu, na ordem de exibição.
 *
 * Observação: conforme o roadmap (Parte 7), o CONTADOR enxerga apenas a tela
 * de Contagem; por isso a maioria dos itens é restrita ao ADMIN.
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    roles: [UserRole.ADMIN],
    icon: ['M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z'],
  },
  {
    label: 'Iniciar Inventário',
    route: '/inventario',
    roles: [UserRole.ADMIN],
    icon: [
      'M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9',
      'M9 3v4a2 2 0 002 2h4',
      'M14 3l7 7',
    ],
  },
  {
    label: 'Cadastrar Contadores',
    route: '/contadores',
    roles: [UserRole.ADMIN],
    icon: [
      'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2',
      'M9 11a4 4 0 100-8 4 4 0 000 8z',
      'M19 8v6M22 11h-6',
    ],
  },
  {
    label: 'Pré-contagem',
    route: '/pre-contagem',
    roles: [UserRole.ADMIN],
    icon: [
      'M9 11l3 3L22 4',
      'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
      'M3 7h6',
    ],
  },
  {
    label: 'Acompanhamento',
    route: '/acompanhamento',
    roles: [UserRole.ADMIN],
    icon: ['M3 3v18h18', 'M7 14l4-4 3 3 5-6'],
  },
  {
    label: 'Contagem',
    route: '/contagem',
    roles: ALL,
    icon: [
      'M9 11l3 3L22 4',
      'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    ],
  },
  {
    label: 'Resultados',
    route: '/resultados',
    roles: [UserRole.ADMIN],
    icon: ['M3 3v18h18', 'M7 16v-5M12 16V8M17 16v-3'],
  },
  {
    label: 'Assinatura Digital',
    route: '/assinatura',
    roles: [UserRole.ADMIN],
    icon: [
      'M3 17c3-1 4-4 6-4s2 2 4 2 3-3 5-3',
      'M3 21h18',
      'M12 3l1.5 3 3 .5-2 2 .5 3-3-1.5L9 14l.5-3-2-2 3-.5L12 3z',
    ],
  },
];
