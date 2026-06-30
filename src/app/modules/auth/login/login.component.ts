/**
 * Componente da tela de login.
 *
 * Apresenta um formulário reativo (e-mail e senha) com validação no cliente,
 * estado de carregamento e tratamento de erros. Em caso de sucesso, delega ao
 * `AuthService` a persistência da sessão e navega para a URL de retorno
 * (ou para a tela inicial).
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Indica se a requisição de login está em andamento. */
  readonly loading = signal(false);

  /** Mensagem de erro a ser exibida ao usuário (ou `null`). */
  readonly errorMessage = signal<string | null>(null);

  /** Controla a visibilidade do campo de senha. */
  readonly showPassword = signal(false);

  /** Formulário reativo de login. */
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  /** Alterna a exibição da senha entre texto e oculto. */
  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  /**
   * Submete o formulário de login.
   *
   * Valida o formulário, chama o serviço de autenticação e trata o resultado:
   * em sucesso, redireciona; em erro, exibe mensagem amigável.
   */
  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(error));
      },
    });
  }

  /**
   * Converte um erro HTTP em uma mensagem amigável em português.
   *
   * @param error Erro retornado pela API.
   * @returns Mensagem legível para o usuário.
   */
  private resolveErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    return (
      error.error?.message ?? 'Falha ao entrar. Verifique suas credenciais.'
    );
  }
}
