/**
 * Serviço de autenticação do frontend.
 *
 * Responsabilidades:
 * - realizar login/logout contra a API;
 * - armazenar e recuperar os tokens (localStorage);
 * - renovar o access token via refresh token;
 * - expor o usuário autenticado de forma reativa (signals).
 *
 * É a única fonte de verdade sobre o estado de autenticação na aplicação.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  User,
  UserRole,
} from '../models/user.model';

/** Chaves usadas para persistir o estado de autenticação no localStorage. */
const ACCESS_TOKEN_KEY = 'inv.accessToken';
const REFRESH_TOKEN_KEY = 'inv.refreshToken';
const USER_KEY = 'inv.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Usuário autenticado atual (ou `null`). Reativo via signal. */
  private readonly currentUser = signal<User | null>(this.loadStoredUser());

  /** Signal somente-leitura do usuário autenticado. */
  readonly user = this.currentUser.asReadonly();

  /** Indica, de forma reativa, se há um usuário autenticado. */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * Autentica o usuário e persiste a sessão.
   *
   * @param credentials E-mail e senha.
   * @returns Observable com a resposta de autenticação.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(tap((response) => this.persistSession(response)));
  }

  /**
   * Renova a sessão usando o refresh token armazenado.
   *
   * @returns Observable com o novo par de tokens.
   */
  refreshSession(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(tap((response) => this.persistSession(response)));
  }

  /**
   * Encerra a sessão: revoga o refresh token no backend e limpa o estado local.
   *
   * A limpeza local ocorre independentemente do resultado da chamada remota.
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${this.baseUrl}/logout`, { refreshToken })
        .subscribe({ error: () => undefined });
    }
    this.clearSession();
  }

  /** @returns O access token atual ou `null`. */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /** @returns O refresh token atual ou `null`. */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Verifica se o usuário autenticado possui um dos papéis informados.
   *
   * @param roles Papéis aceitos.
   * @returns `true` se o usuário tiver um dos papéis.
   */
  hasRole(...roles: UserRole[]): boolean {
    const current = this.currentUser();
    return current !== null && roles.includes(current.role);
  }

  /**
   * Rota inicial padrão de acordo com o papel do usuário.
   *
   * O CONTADOR vai direto para a tela de contagem (única que ele acessa,
   * conforme o roadmap); os demais vão para o dashboard.
   *
   * @returns O caminho da rota inicial.
   */
  defaultRoute(): string {
    return this.hasRole(UserRole.CONTADOR) ? '/contagem' : '/dashboard';
  }

  /**
   * Persiste tokens e usuário, atualizando o estado reativo.
   *
   * @param response Resposta de autenticação do backend.
   */
  private persistSession(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  /** Remove todo o estado de autenticação local. */
  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  /**
   * Recupera o usuário previamente persistido (ao recarregar a página).
   *
   * @returns O usuário armazenado ou `null`.
   */
  private loadStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
