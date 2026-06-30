/**
 * Interceptor HTTP de autenticação.
 *
 * - Anexa o cabeçalho `Authorization: Bearer <accessToken>` às requisições
 *   destinadas à API (exceto as próprias rotas de autenticação).
 * - Ao receber 401, tenta renovar a sessão uma única vez via refresh token e
 *   reenvia a requisição original. As renovações concorrentes compartilham a
 *   mesma chamada (single-flight) para evitar múltiplos refresh simultâneos.
 * - Se a renovação falhar, encerra a sessão e redireciona para o login
 *   (logout automático).
 */

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../core/services/auth.service';

/** Indica se uma renovação de token já está em andamento. */
let isRefreshing = false;

/** Emite o novo access token assim que a renovação conclui. */
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/** Caminhos de autenticação que não devem disparar refresh automático. */
const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

/**
 * Interceptor funcional de autenticação.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuthPath = AUTH_PATHS.some((path) => req.url.includes(path));
  const token = auth.getAccessToken();

  const authReq = token && !isAuthPath ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Só tratamos 401 em rotas protegidas (não nas próprias rotas de auth).
      if (error.status === 401 && !isAuthPath) {
        return handle401(req, next, auth, router);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Clona a requisição adicionando o cabeçalho Authorization.
 */
function addToken(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Trata respostas 401 tentando renovar a sessão e reenviar a requisição.
 */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  // Sem refresh token => não há como renovar: logout imediato.
  if (!auth.getRefreshToken()) {
    return forceLogout(auth, router);
  }

  if (isRefreshing) {
    // Aguarda a renovação em andamento e reenvia com o novo token.
    return refreshedToken$.pipe(
      filter((value): value is string => value !== null),
      take(1),
      switchMap((newToken) => next(addToken(req, newToken)))
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);

  return auth.refreshSession().pipe(
    switchMap((response) => {
      isRefreshing = false;
      refreshedToken$.next(response.accessToken);
      return next(addToken(req, response.accessToken));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      forceLogout(auth, router).subscribe();
      return throwError(() => refreshError);
    })
  );
}

/**
 * Limpa a sessão e redireciona para a tela de login.
 */
function forceLogout(
  auth: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  auth.clearSession();
  void router.navigate(['/login']);
  return throwError(() => new Error('Sessão expirada.'));
}
