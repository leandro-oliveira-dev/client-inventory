/**
 * Guard de autenticação.
 *
 * Protege rotas que exigem usuário autenticado. Quando não há sessão ativa,
 * redireciona para o login preservando a URL de destino em `returnUrl`.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

/**
 * Permite a ativação da rota apenas para usuários autenticados.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
