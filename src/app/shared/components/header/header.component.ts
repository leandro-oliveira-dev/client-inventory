/**
 * Cabeçalho (header) da área autenticada.
 *
 * Exibe o botão de alternância do menu, o título da página atual, o seletor de
 * tema (claro/escuro) e o menu do usuário (com logout). Integra-se aos serviços
 * de autenticação e de tema da aplicação.
 */

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { EngineService } from '../../../core/services/engine.service';
import { UserRole } from '../../../core/models/user.model';
import { Alert } from '../../../core/models/engine.model';

/** Intervalo de atualização automática dos alertas do ADMIN (ms). */
const ALERTS_POLL_MS = 15000;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly engineService = inject(EngineService);

  /** Título da página exibido no header. */
  @Input() pageTitle = '';

  /** Emite quando o usuário aciona o botão de menu (abre/recolhe a sidebar). */
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  /** Controla a visibilidade do menu suspenso do usuário. */
  readonly userMenuOpen = signal(false);

  /** Alertas recentes (Parte 7) — apenas para o ADMIN. */
  readonly alerts = signal<Alert[]>([]);
  /** Quantidade de alertas não lidos. */
  readonly unread = signal(0);
  /** Controla a visibilidade do painel de alertas. */
  readonly alertsOpen = signal(false);

  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (this.isAdmin) {
      this.loadAlerts();
      this.pollId = setInterval(() => this.loadAlerts(), ALERTS_POLL_MS);
    }
  }

  ngOnDestroy(): void {
    if (this.pollId !== null) {
      clearInterval(this.pollId);
    }
  }

  /** Indica se o usuário autenticado é ADMIN. */
  get isAdmin(): boolean {
    return this.auth.hasRole(UserRole.ADMIN);
  }

  /** Abre/fecha o painel de alertas; ao abrir, marca todos como lidos. */
  toggleAlerts(): void {
    const willOpen = !this.alertsOpen();
    this.alertsOpen.set(willOpen);
    if (willOpen && this.unread() > 0) {
      this.unread.set(0);
      this.engineService.markAlertsRead().subscribe({ error: () => undefined });
    }
  }

  /** Fecha o painel de alertas (ex.: ao perder o foco). */
  closeAlerts(): void {
    this.alertsOpen.set(false);
  }

  /** Carrega os alertas do backend. */
  private loadAlerts(): void {
    this.engineService.alerts().subscribe({
      next: (summary) => {
        this.alerts.set(summary.alertas);
        this.unread.set(summary.naoLidos);
      },
      error: () => undefined,
    });
  }

  /** Alterna a exibição do menu do usuário. */
  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  /** Fecha o menu do usuário (ex.: ao perder o foco). */
  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  /** Alterna entre tema claro e escuro. */
  toggleTheme(): void {
    this.themeService.toggle();
  }

  /** Encerra a sessão e retorna à tela de login. */
  logout(): void {
    this.closeUserMenu();
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  /** Iniciais do usuário, exibidas no avatar. */
  get initials(): string {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
