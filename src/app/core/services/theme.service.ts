/**
 * Serviço de tema (claro/escuro).
 *
 * Gerencia a preferência de tema do usuário, persiste a escolha no
 * localStorage e aplica a classe `dark-mode` ao `<body>` (consumida pelos
 * tokens CSS definidos em `styles.scss`). Na primeira visita, respeita a
 * preferência do sistema operacional (`prefers-color-scheme`).
 */

import { Injectable, signal } from '@angular/core';

/** Temas disponíveis. */
export type Theme = 'light' | 'dark';

/** Chave de persistência da preferência de tema. */
const THEME_KEY = 'inv.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Tema atual, exposto de forma reativa. */
  private readonly current = signal<Theme>(this.resolveInitialTheme());

  /** Signal somente-leitura do tema atual. */
  readonly theme = this.current.asReadonly();

  constructor() {
    this.apply(this.current());
  }

  /** Alterna entre os temas claro e escuro. */
  toggle(): void {
    this.setTheme(this.current() === 'dark' ? 'light' : 'dark');
  }

  /**
   * Define explicitamente o tema, persistindo e aplicando a mudança.
   *
   * @param theme Tema desejado.
   */
  setTheme(theme: Theme): void {
    this.current.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.apply(theme);
  }

  /**
   * Aplica o tema ao documento adicionando/removendo a classe `dark-mode`.
   *
   * @param theme Tema a aplicar.
   */
  private apply(theme: Theme): void {
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }

  /**
   * Resolve o tema inicial: usa a preferência salva ou, na ausência dela, a
   * preferência do sistema operacional.
   *
   * @returns O tema inicial.
   */
  private resolveInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)'
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }
}
