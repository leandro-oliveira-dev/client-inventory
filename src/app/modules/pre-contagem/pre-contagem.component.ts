/**
 * Tela de Pré-contagem (Parte 10.1 — modo SEM_EXCEL).
 *
 * Quando a logística não tem a planilha de estoque, esta tela permite ao ADMIN
 * criar um inventário em branco e **levantar o estoque do zero**: para cada
 * posição, informar os itens encontrados (código, descrição e quantidade). Uma
 * posição pode ter vários itens; itens de mesmo código são somados. Ao encerrar,
 * o levantamento vira o estoque inicial e o inventário fica pronto para a contagem
 * de conferência (tela "Iniciar Inventário").
 */

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import { PreCountService } from '../../core/services/precount.service';
import { Inventory } from '../../core/models/inventory.model';
import { PreCountSummary } from '../../core/models/precount.model';

/** Uma linha de item no formulário de levantamento. */
interface PreCountLine {
  codigo: string;
  descricao: string;
  quantidade: number | null;
}

@Component({
  selector: 'app-pre-contagem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pre-contagem.component.html',
  styleUrls: ['./pre-contagem.component.scss'],
})
export class PreContagemComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly preCountService = inject(PreCountService);

  /** Inventários em pré-contagem disponíveis. */
  readonly inventories = signal<Inventory[]>([]);
  /** Inventário selecionado. */
  readonly selectedInventory = signal<string>('');
  /** Resumo da pré-contagem do inventário selecionado. */
  readonly summary = signal<PreCountSummary | null>(null);

  /** Formulário de novo inventário sem Excel. */
  readonly novoNome = signal('');
  readonly novoCliente = signal('');
  readonly creating = signal(false);

  /** Formulário de levantamento de uma posição. */
  readonly posicao = signal('');
  readonly linhas = signal<PreCountLine[]>([{ codigo: '', descricao: '', quantidade: null }]);
  readonly submitting = signal(false);
  readonly closing = signal(false);

  readonly error = signal<string | null>(null);
  readonly feedback = signal<string | null>(null);

  /** Há itens já levantados (habilita o encerramento). */
  readonly podeEncerrar = computed(() => (this.summary()?.totalItens ?? 0) > 0);

  constructor() {
    this.loadInventories();
  }

  /** Cria um inventário sem Excel. */
  criarInventario(): void {
    const nome = this.novoNome().trim();
    if (!nome || this.creating()) {
      if (!nome) {
        this.error.set('Informe o nome do inventário.');
      }
      return;
    }
    this.creating.set(true);
    this.error.set(null);
    this.preCountService
      .createInventory({ nome, cliente: this.novoCliente().trim() || undefined })
      .subscribe({
        next: (summary) => {
          this.creating.set(false);
          this.novoNome.set('');
          this.novoCliente.set('');
          this.summary.set(summary);
          this.selectedInventory.set(summary.inventoryId);
          this.feedback.set(`Inventário "${summary.inventoryNome}" criado. Levante as posições abaixo.`);
          this.loadInventories();
        },
        error: (err: HttpErrorResponse) => {
          this.creating.set(false);
          this.error.set(this.parseError(err));
        },
      });
  }

  /** Reage à troca do inventário selecionado. */
  onInventoryChange(inventoryId: string): void {
    this.selectedInventory.set(inventoryId);
    this.summary.set(null);
    this.feedback.set(null);
    this.error.set(null);
    if (inventoryId) {
      this.loadSummary();
    }
  }

  /** Adiciona uma linha de item. */
  adicionarLinha(): void {
    this.linhas.update((l) => [...l, { codigo: '', descricao: '', quantidade: null }]);
  }

  /** Remove uma linha de item. */
  removerLinha(index: number): void {
    this.linhas.update((l) => (l.length > 1 ? l.filter((_, i) => i !== index) : l));
  }

  /** Atualiza um campo de uma linha. */
  setCampo(index: number, campo: 'codigo' | 'descricao', value: string): void {
    this.linhas.update((l) => l.map((x, i) => (i === index ? { ...x, [campo]: value } : x)));
  }

  /** Atualiza a quantidade de uma linha. */
  setQuantidade(index: number, value: number | null): void {
    this.linhas.update((l) => l.map((x, i) => (i === index ? { ...x, quantidade: value } : x)));
  }

  /** Submete o levantamento da posição. */
  submeterPosicao(): void {
    const inventoryId = this.selectedInventory();
    const posicao = this.posicao().trim();
    if (!inventoryId || this.submitting()) {
      return;
    }
    if (!posicao) {
      this.error.set('Informe a posição.');
      return;
    }

    const itens: { codigo: string; descricao: string; quantidade: number }[] = [];
    for (const linha of this.linhas()) {
      const codigo = linha.codigo.trim();
      const descricao = linha.descricao.trim();
      if (!codigo && linha.quantidade === null && !descricao) {
        continue;
      }
      if (!codigo) {
        this.error.set('Informe o código de todos os itens.');
        return;
      }
      if (!descricao) {
        this.error.set(`Informe a descrição do item "${codigo}".`);
        return;
      }
      const q = linha.quantidade;
      if (q === null || q < 0 || Number.isNaN(Number(q))) {
        this.error.set(`Informe uma quantidade válida para o item "${codigo}".`);
        return;
      }
      itens.push({ codigo, descricao, quantidade: Number(q) });
    }
    if (itens.length === 0) {
      this.error.set('Informe ao menos um item.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.preCountService.submit({ inventoryId, posicao, itens }).subscribe({
      next: (summary) => {
        this.submitting.set(false);
        this.summary.set(summary);
        this.feedback.set(`Posição "${posicao}" registrada.`);
        this.posicao.set('');
        this.linhas.set([{ codigo: '', descricao: '', quantidade: null }]);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  /** Encerra a pré-contagem e materializa o estoque. */
  encerrar(): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId || this.closing() || !this.podeEncerrar()) {
      return;
    }
    this.closing.set(true);
    this.error.set(null);
    this.preCountService.close(inventoryId).subscribe({
      next: (res) => {
        this.closing.set(false);
        this.feedback.set(
          `Pré-contagem encerrada: ${res.produtosCriados} item(ns) viraram o estoque inicial. ` +
            'Agora inicie a contagem em "Iniciar Inventário".',
        );
        this.summary.set(null);
        this.selectedInventory.set('');
        this.loadInventories();
      },
      error: (err: HttpErrorResponse) => {
        this.closing.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  private loadInventories(): void {
    this.inventoryService.list().subscribe({
      next: (list) => this.inventories.set(list.filter((i) => i.status === 'EM_PRE_CONTAGEM')),
      error: (err: HttpErrorResponse) => this.error.set(this.parseError(err)),
    });
  }

  private loadSummary(): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId) {
      return;
    }
    this.preCountService.summary(inventoryId).subscribe({
      next: (summary) => this.summary.set(summary),
      error: (err: HttpErrorResponse) => this.error.set(this.parseError(err)),
    });
  }

  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
    return err.error?.message ?? 'Ocorreu um erro. Tente novamente.';
  }
}
