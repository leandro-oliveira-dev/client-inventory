/**
 * Layout principal da área autenticada.
 *
 * Compõe o menu lateral, o cabeçalho e a área de conteúdo (`router-outlet`).
 * Responsabilidades:
 * - controlar o recolhimento da sidebar (desktop) e a abertura em gaveta
 *   (mobile, com backdrop);
 * - derivar o título da página atual a partir do `data.title` da rota ativa.
 */

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

/** Largura (px) a partir da qual o layout passa a ser tratado como mobile. */
const MOBILE_BREAKPOINT = 1024;

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  /** Indica se a sidebar está recolhida (apenas ícones) no desktop. */
  readonly collapsed = signal(false);

  /** Indica se a sidebar (gaveta) está aberta no mobile. */
  readonly mobileOpen = signal(false);

  /** Título da página corrente, exibido no header. */
  readonly pageTitle = signal('');

  constructor() {
    // Atualiza o título a cada navegação concluída, lendo o data.title da rota.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.resolveTitle()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((title) => this.pageTitle.set(title));

    this.pageTitle.set(this.resolveTitle());
  }

  /**
   * Alterna o menu: gaveta no mobile, recolhimento no desktop.
   */
  toggleSidebar(): void {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      this.mobileOpen.update((open) => !open);
    } else {
      this.collapsed.update((value) => !value);
    }
  }

  /** Fecha a gaveta do mobile (ao clicar no backdrop ou navegar). */
  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  /**
   * Percorre a árvore de snapshots de rota até a folha e retorna seu
   * `data.title`. Usa `snapshot` (já disponível na criação do componente) em
   * vez da árvore de `ActivatedRoute`, evitando acessar nós ainda não
   * inicializados durante a ativação da rota.
   *
   * @returns O título da rota corrente (ou string vazia).
   */
  private resolveTitle(): string {
    let snapshot = this.route.snapshot;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    return (snapshot.data['title'] as string | undefined) ?? '';
  }
}
