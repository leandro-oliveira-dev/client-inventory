/**
 * Cabeçalho (header) da área autenticada.
 *
 * Exibe o botão de alternância do menu, o título da página atual, o seletor de
 * tema (claro/escuro) e o menu do usuário (com logout). Integra-se aos serviços
 * de autenticação e de tema da aplicação.
 */

import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);

  /** Título da página exibido no header. */
  @Input() pageTitle = '';

  /** Emite quando o usuário aciona o botão de menu (abre/recolhe a sidebar). */
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  /** Controla a visibilidade do menu suspenso do usuário. */
  readonly userMenuOpen = signal(false);

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
