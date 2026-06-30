/**
 * Menu lateral de navegação.
 *
 * Exibe a logo e os itens de menu permitidos ao usuário autenticado (filtrados
 * por papel). Destaca o item da rota ativa e, no modo recolhido, mostra apenas
 * os ícones. Emite `navigate` quando um item é clicado — usado para fechar o
 * menu automaticamente em telas pequenas.
 */

import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MENU_ITEMS, MenuItem } from '../../../core/constants/menu';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  /** Quando `true`, a sidebar exibe apenas ícones (modo recolhido). */
  @Input() collapsed = false;

  /** Emite ao navegar (clicar em um item), para fechar o menu no mobile. */
  @Output() readonly navigate = new EventEmitter<void>();

  /** Itens de menu visíveis ao papel do usuário autenticado. */
  readonly items = computed<MenuItem[]>(() => {
    const user = this.auth.user();
    if (!user) {
      return [];
    }
    return MENU_ITEMS.filter((item) => item.roles.includes(user.role));
  });
}
