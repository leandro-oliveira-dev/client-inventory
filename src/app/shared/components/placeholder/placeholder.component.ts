/**
 * Página placeholder ("em desenvolvimento").
 *
 * Componente reutilizável usado pelas rotas cujas funcionalidades serão
 * implementadas em etapas futuras do roadmap. Lê `title`, `description` e
 * `stage` do `data` da rota, mantendo a navegação funcional sem duplicar
 * telas quase idênticas.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="placeholder">
      <div class="placeholder__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      @if (stage) {
        <span class="placeholder__badge">Roadmap · {{ stage }}</span>
      }
    </section>
  `,
  styles: [
    `
      .placeholder {
        max-width: 480px;
        margin: 4rem auto;
        text-align: center;
        display: grid;
        gap: 0.75rem;
        justify-items: center;
      }
      .placeholder__icon {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 20px;
        color: var(--primary);
        background: var(--primary-soft);
      }
      .placeholder__icon svg {
        width: 38px;
        height: 38px;
      }
      h2 {
        font-size: 1.5rem;
        color: var(--text);
      }
      p {
        color: var(--text-muted);
        line-height: 1.6;
      }
      .placeholder__badge {
        margin-top: 0.5rem;
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--primary);
        background: var(--primary-soft);
      }
    `,
  ],
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data = this.route.snapshot.data;

  /** Título da tela (vindo do data da rota). */
  readonly title = (this.data['title'] as string) ?? 'Em breve';

  /** Descrição da tela (vindo do data da rota). */
  readonly description =
    (this.data['description'] as string) ??
    'Esta funcionalidade será implementada em uma próxima etapa do projeto.';

  /** Identificação da etapa do roadmap (opcional). */
  readonly stage = (this.data['stage'] as string) ?? '';
}
