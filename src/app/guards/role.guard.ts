/**
 * Guard de controle de acesso por papel (RBAC).
 *
 * Restringe rotas a papéis específicos. Os papéis aceitos são informados na
 * propriedade `data.roles` da rota. Usuários sem o papel exigido são
 * redirecionados para a tela inicial.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserRole } from '../core/models/user.model';

/**
 * Cria um guard que autoriza apenas os papéis informados.
 *
 * @param roles Papéis com permissão de acesso.
 * @returns Um `CanActivateFn` que valida o papel do usuário.
 *
 * @example
 * { path: 'relatorios', canActivate: [roleGuard(UserRole.ADMIN)], ... }
 */
export const roleGuard = (...roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated() && auth.hasRole(...roles)) {
      return true;
    }

    // Não autenticado vai para o login; autenticado sem permissão vai à sua
    // rota inicial (definida pelo papel).
    return router.createUrlTree([
      auth.isAuthenticated() ? auth.defaultRoute() : '/login',
    ]);
  };
};
