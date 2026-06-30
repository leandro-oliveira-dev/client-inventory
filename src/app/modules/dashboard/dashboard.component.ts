/**
 * Tela inicial (Dashboard).
 *
 * Visão geral da operação para o ADMIN. Nesta etapa (Parte 3) apresenta a
 * estrutura visual: saudação, cartões de indicadores e atalhos para os módulos.
 * Os números são ilustrativos — os dados reais serão integrados nas etapas de
 * importação (Parte 4), motor de contagem (Parte 6) e relatórios (Parte 9).
 */

import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** Cartão de indicador exibido no topo do dashboard. */
interface StatCard {
  label: string;
  value: string;
  hint: string;
  accent: string;
}

/** Atalho de ação rápida para um módulo. */
interface QuickAction {
  label: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  /** Primeiro nome do usuário autenticado, para a saudação. */
  readonly firstName = computed(
    () => this.auth.user()?.name.split(' ')[0] ?? ''
  );

  /** Indicadores (valores ilustrativos nesta etapa). */
  readonly stats: StatCard[] = [
    { label: 'Itens cadastrados', value: '—', hint: 'Aguardando importação', accent: 'var(--primary)' },
    { label: 'Posições contadas', value: '—', hint: 'Motor de contagem', accent: 'var(--success)' },
    { label: 'Pendentes', value: '—', hint: 'A processar', accent: 'var(--warning)' },
    { label: 'Divergências', value: '—', hint: 'Relatórios', accent: 'var(--danger)' },
  ];

  /** Atalhos rápidos para os módulos administrativos. */
  readonly actions: QuickAction[] = [
    { label: 'Iniciar Inventário', description: 'Importar planilha e abrir uma contagem', route: '/inventario' },
    { label: 'Cadastrar Contadores', description: 'Gerenciar a equipe de contagem', route: '/contadores' },
    { label: 'Acompanhamento', description: 'Progresso em tempo real', route: '/acompanhamento' },
    { label: 'Resultados', description: 'Relatórios e divergências', route: '/resultados' },
  ];
}
