/**
 * Componente de logo do Inventário App.
 *
 * Componente de apresentação reutilizável que exibe o ícone (caixa/estoque) e,
 * opcionalmente, o nome do aplicativo. Usado no menu lateral e na tela de
 * login. Em modo `compact`, esconde o texto (útil na sidebar recolhida).
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo" [class.logo--compact]="compact">
      <span class="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M3 7l9-4 9 4-9 4-9-4z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path
            d="M3 7v10l9 4 9-4V7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path d="M12 11v10" stroke="currentColor" stroke-width="1.6" />
        </svg>
      </span>
      @if (!compact) {
        <span class="logo__text">Inventário<strong>App</strong></span>
      }
    </div>
  `,
  styles: [
    `
      .logo {
        display: flex;
        align-items: center;
        gap: 0.7rem;
      }
      .logo__mark {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 11px;
        color: var(--on-primary);
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
      }
      .logo__mark svg {
        width: 24px;
        height: 24px;
      }
      .logo__text {
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--text);
        white-space: nowrap;
      }
      .logo__text strong {
        color: var(--primary);
      }
    `,
  ],
})
export class LogoComponent {
  /** Quando `true`, exibe apenas o ícone (sem o texto). */
  @Input() compact = false;
}
