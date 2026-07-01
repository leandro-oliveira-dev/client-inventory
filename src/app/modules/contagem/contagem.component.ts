/**
 * Tela de Contagem (Parte 7 + Parte 10.1) — a tela do contador.
 *
 * O sistema entrega automaticamente as posições que o contador deve contar
 * (fila), uma de cada vez. Cada posição pode conter **vários itens** (Parte 10.1):
 * o contador informa a quantidade de **cada item** e pode **adicionar** um item
 * que encontrou mas não estava previsto (código livre) — para que nada passe
 * despercebido. O estoque do sistema nunca é exibido. O motor (Parte 6) decide o
 * desfecho (finaliza ou gera a próxima contagem).
 *
 * A fila é atualizada automaticamente (polling). Quando não há posições, exibe
 * "Não há contagens no momento".
 */

import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EngineService } from '../../core/services/engine.service';
import { CountTask, Queue, SubmitCountResult } from '../../core/models/engine.model';

/** Intervalo de atualização automática da fila (ms). */
const POLL_INTERVAL_MS = 12000;

/** Uma linha de contagem (um item da posição ativa). */
interface CountLine {
  productId?: string;
  codigo: string;
  descricao: string;
  quantidade: number | null;
  /** Item adicionado pelo contador (código/descrição editáveis). */
  adicionado: boolean;
}

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
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly lastResult = signal<SubmitCountResult | null>(null);
  readonly error = signal<string | null>(null);

  /** Linhas de contagem da posição ativa. */
  readonly linhas = signal<CountLine[]>([]);
  /** Posição atualmente carregada nas linhas (para detectar troca). */
  private readonly currentPositionId = signal<string>('');

  /** Tarefa ativa (primeira da fila). */
  readonly activeTask = computed<CountTask | null>(() => this.queue()?.tarefas[0] ?? null);
  /** Próximas tarefas (após a ativa). */
  readonly upcoming = computed<CountTask[]>(() => this.queue()?.tarefas.slice(1) ?? []);
  /** Total de posições pendentes para este contador. */
  readonly pendentes = computed<number>(() => this.queue()?.pendentes ?? 0);

  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadQueue(true);
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

  /** Atualiza a quantidade de uma linha. */
  setQuantidade(index: number, value: number | null): void {
    this.linhas.update((linhas) =>
      linhas.map((l, i) => (i === index ? { ...l, quantidade: value } : l)),
    );
  }

  /** Atualiza um campo textual (código/descrição) de uma linha adicionada. */
  setCampo(index: number, campo: 'codigo' | 'descricao', value: string): void {
    this.linhas.update((linhas) =>
      linhas.map((l, i) => (i === index ? { ...l, [campo]: value } : l)),
    );
  }

  /** Adiciona uma linha de item novo (código livre). */
  adicionarItem(): void {
    this.linhas.update((linhas) => [
      ...linhas,
      { codigo: '', descricao: '', quantidade: null, adicionado: true },
    ]);
  }

  /** Remove uma linha adicionada. */
  removerItem(index: number): void {
    this.linhas.update((linhas) => linhas.filter((_, i) => i !== index));
  }

  /** Envia a contagem da posição ativa. */
  submit(): void {
    const task = this.activeTask();
    if (!task || this.submitting()) {
      return;
    }

    const linhas = this.linhas();
    const itens: { codigo: string; descricao: string; quantidade: number }[] = [];

    for (const linha of linhas) {
      const codigo = linha.codigo.trim();
      const adicionadoVazio = linha.adicionado && !codigo && linha.quantidade === null;
      if (adicionadoVazio) {
        continue; // ignora linhas adicionadas em branco
      }
      if (!codigo) {
        this.error.set('Informe o código de todos os itens adicionados.');
        return;
      }
      if (linha.adicionado && !linha.descricao.trim()) {
        this.error.set(`Informe a descrição do item "${codigo}".`);
        return;
      }
      const q = linha.quantidade;
      if (q === null || q === undefined || q < 0 || Number.isNaN(Number(q))) {
        this.error.set(`Informe uma quantidade válida para o item "${codigo}".`);
        return;
      }
      itens.push({ codigo, descricao: linha.descricao.trim() || codigo, quantidade: Number(q) });
    }

    if (itens.length === 0) {
      this.error.set('Informe ao menos um item contado.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.engineService
      .submit({ inventoryId: task.inventoryId, positionCountId: task.positionCountId, itens })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.lastResult.set(result);
          this.currentPositionId.set(''); // força recarregar as linhas da próxima posição
          this.loadQueue(false);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(this.parseError(err));
          this.currentPositionId.set('');
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
        this.syncLinhas();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (initial) {
          this.error.set(this.parseError(err));
        }
      },
    });
  }

  /** Reconstrói as linhas quando a posição ativa muda. */
  private syncLinhas(): void {
    const task = this.activeTask();
    if (!task) {
      this.currentPositionId.set('');
      this.linhas.set([]);
      return;
    }
    if (task.positionCountId === this.currentPositionId()) {
      return; // mesma posição: preserva o que o contador já digitou
    }
    this.currentPositionId.set(task.positionCountId);
    this.linhas.set(
      task.itens.map((i) => ({
        productId: i.productId,
        codigo: i.codigo,
        descricao: i.descricao,
        quantidade: null,
        adicionado: false,
      })),
    );
  }

  /** Traduz um erro HTTP em mensagem amigável. */
  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
    return err.error?.message ?? 'Ocorreu um erro. Tente novamente.';
  }
}
