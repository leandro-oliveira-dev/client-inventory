/**
 * Tela de Contagem (Parte 7) — a tela do contador.
 *
 * O sistema entrega automaticamente as posições que o contador deve contar
 * (fila), uma de cada vez. O contador informa apenas a quantidade — **o estoque
 * do sistema nunca é exibido** para não influenciar a contagem — e o motor
 * (Parte 6) decide o desfecho (finaliza ou gera a próxima contagem).
 *
 * A fila é atualizada automaticamente (polling) para captar novas posições
 * geradas por reconferências ou por inventários iniciados pelo ADMIN. Quando não
 * há posições, exibe "Não há contagens no momento".
 */

import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EngineService } from '../../core/services/engine.service';
import { CountTask, Queue, SubmitCountResult } from '../../core/models/engine.model';

/** Intervalo de atualização automática da fila (ms). */
const POLL_INTERVAL_MS = 12000;

@Component({
  selector: 'app-contagem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contagem.component.html',
  styleUrls: ['./contagem.component.scss'],
})
export class ContagemComponent implements OnDestroy {
  private readonly engineService = inject(EngineService);

  /** Fila atual do contador. */
  readonly queue = signal<Queue | null>(null);
  /** Carregando a fila pela primeira vez. */
  readonly loading = signal(true);
  /** Enviando uma contagem. */
  readonly submitting = signal(false);
  /** Quantidade digitada para a tarefa ativa. */
  readonly quantidade = signal<number | null>(null);
  /** Resultado da última contagem enviada. */
  readonly lastResult = signal<SubmitCountResult | null>(null);
  /** Mensagem de erro. */
  readonly error = signal<string | null>(null);

  /** Tarefa ativa (primeira da fila). */
  readonly activeTask = computed<CountTask | null>(() => this.queue()?.tarefas[0] ?? null);
  /** Próximas tarefas (após a ativa). */
  readonly upcoming = computed<CountTask[]>(() => this.queue()?.tarefas.slice(1) ?? []);
  /** Total de posições pendentes para este contador. */
  readonly pendentes = computed<number>(() => this.queue()?.pendentes ?? 0);

  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadQueue(true);
    // Atualização automática: só recarrega quando não há envio em andamento.
    this.pollId = setInterval(() => {
      if (!this.submitting()) {
        this.loadQueue(false);
      }
    }, POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollId !== null) {
      clearInterval(this.pollId);
    }
  }

  /** Rótulo ordinal da contagem (1ª/2ª/3ª). */
  ordinal(numero: number): string {
    return numero === 1 ? '1ª' : numero === 2 ? '2ª' : '3ª';
  }

  /** Envia a contagem da tarefa ativa. */
  submit(): void {
    const task = this.activeTask();
    const value = this.quantidade();
    if (!task || this.submitting()) {
      return;
    }
    if (value === null || value === undefined || value < 0 || Number.isNaN(Number(value))) {
      this.error.set('Informe uma quantidade válida (número maior ou igual a zero).');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.engineService
      .submit({
        inventoryId: task.inventoryId,
        productId: task.productId,
        quantidadeContada: Number(value),
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.lastResult.set(result);
          this.quantidade.set(null);
          this.loadQueue(false);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(this.parseError(err));
          // Recarrega para refletir eventual mudança de estado (ex.: 409).
          this.loadQueue(false);
        },
      });
  }

  /** Recarrega a fila manualmente. */
  refresh(): void {
    this.loadQueue(false);
  }

  /** Carrega a fila do backend. */
  private loadQueue(initial: boolean): void {
    if (initial) {
      this.loading.set(true);
    }
    this.engineService.queue().subscribe({
      next: (queue) => {
        this.queue.set(queue);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (initial) {
          this.error.set(this.parseError(err));
        }
      },
    });
  }

  /** Traduz um erro HTTP em mensagem amigável. */
  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
    return err.error?.message ?? 'Ocorreu um erro. Tente novamente.';
  }
}
