/**
 * Tela inicial (placeholder da Parte 2).
 *
 * Tela mínima protegida por autenticação, cujo objetivo nesta etapa é apenas
 * confirmar que o fluxo de login/JWT está funcionando. A estrutura visual
 * definitiva (menu lateral, header, dashboard) será construída na Parte 3.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home">
      <div class="card">
        <div class="badge">✓</div>
        <h1>Autenticação funcionando</h1>
        <p class="subtitle">
          Você está autenticado e esta rota é protegida por JWT.
        </p>

        @if (auth.user(); as user) {
          <div class="user">
            <div class="user__avatar">{{ user.name.charAt(0) }}</div>
            <div class="user__info">
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }}</span>
              <span class="role">{{ user.role }}</span>
            </div>
          </div>
        }

        <button class="logout" (click)="onLogout()">Sair</button>
      </div>
    </div>
  `,
  styles: [
    `
      .home {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
      }
      .card {
        background: #fff;
        border-radius: 16px;
        padding: 2.5rem;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }
      .badge {
        width: 64px;
        height: 64px;
        margin: 0 auto 1.25rem;
        display: grid;
        place-items: center;
        font-size: 2rem;
        color: #fff;
        border-radius: 50%;
        background: #16a34a;
      }
      h1 {
        font-size: 1.5rem;
        color: #1e293b;
      }
      .subtitle {
        margin-top: 0.5rem;
        color: #64748b;
      }
      .user {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin: 1.75rem 0;
        padding: 1rem;
        text-align: left;
        background: #f8fafc;
        border-radius: 12px;
      }
      .user__avatar {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
      }
      .user__info {
        display: grid;
        gap: 0.15rem;
      }
      .user__info strong {
        color: #1e293b;
      }
      .user__info span {
        font-size: 0.85rem;
        color: #64748b;
      }
      .role {
        font-size: 0.7rem !important;
        font-weight: 700;
        color: #4f46e5 !important;
        letter-spacing: 0.05em;
      }
      .logout {
        width: 100%;
        padding: 0.8rem;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        background: #fff;
        color: #dc2626;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .logout:hover {
        background: #fef2f2;
      }
    `,
  ],
})
export class HomeComponent {
  /** Serviço de autenticação (exposto ao template para ler o usuário). */
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Encerra a sessão e retorna à tela de login. */
  onLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
