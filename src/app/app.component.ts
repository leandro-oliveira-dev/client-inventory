import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

/**
 * Componente raiz da aplicação.
 *
 * Injeta o `ThemeService` para que o tema (claro/escuro) seja aplicado desde
 * o carregamento inicial — inclusive na tela de login. O conteúdo é renderizado
 * pelo `router-outlet`.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Inventário App';

  /** Inicializa o serviço de tema (aplica a preferência salva/do sistema). */
  private readonly theme = inject(ThemeService);
}
