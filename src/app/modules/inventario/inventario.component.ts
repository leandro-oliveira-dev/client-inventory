/**
 * Tela de Iniciar Inventário (Parte 4).
 *
 * Permite ao ADMIN baixar a planilha-modelo, enviar um arquivo Excel (clique
 * ou arrastar-e-soltar) e importar o inventário. Exibe o resultado da
 * importação ou a lista de erros de validação retornada pelo backend, além de
 * listar os inventários já importados.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import { EngineService } from '../../core/services/engine.service';
import {
  ImportError,
  ImportResult,
  Inventory,
  Product,
} from '../../core/models/inventory.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly engineService = inject(EngineService);

  /** Inventário selecionado para editar valores unitários. */
  readonly valuesInventory = signal<string>('');
  /** Produtos do inventário selecionado. */
  readonly products = signal<Product[]>([]);
  readonly loadingValues = signal(false);
  readonly savingValueId = signal<string | null>(null);

  /** Inventários que ainda podem ter valores editados (não finalizados). */
  readonly editableInventories = computed(() =>
    this.inventories().filter((i) => i.status !== 'FINALIZADO'),
  );

  /** ID do inventário cuja contagem está sendo iniciada (ou `null`). */
  readonly startingId = signal<string | null>(null);
  /** Feedback da ação de iniciar contagem. */
  readonly startFeedback = signal<{ type: 'ok' | 'erro'; msg: string } | null>(null);

  /** Arquivo selecionado para importação. */
  readonly file = signal<File | null>(null);
  /** Nome opcional do inventário. */
  readonly nome = signal('');
  /** Importação em andamento. */
  readonly importing = signal(false);
  /** Indica se há um arquivo sendo arrastado sobre a área. */
  readonly dragging = signal(false);

  /** Resultado da última importação bem-sucedida. */
  readonly result = signal<ImportResult | null>(null);
  /** Mensagem de erro geral. */
  readonly errorMessage = signal<string | null>(null);
  /** Lista de erros de validação (por linha). */
  readonly errors = signal<ImportError[]>([]);

  /** Inventários já importados. */
  readonly inventories = signal<Inventory[]>([]);
  /** Carregando a lista de inventários. */
  readonly loadingList = signal(false);

  constructor() {
    this.loadInventories();
  }

  /** Baixa a planilha-modelo e dispara o download no navegador. */
  downloadTemplate(): void {
    this.inventoryService.downloadTemplate().subscribe({
      next: (blob) => this.saveBlob(blob, 'modelo-inventario.xlsx'),
      error: () =>
        this.errorMessage.set('Não foi possível baixar o modelo. Tente novamente.'),
    });
  }

  /** Manipula a seleção de arquivo pelo input. */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
  }

  /** Manipula o drop de arquivo na área de upload. */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  /** Realça a área ao arrastar um arquivo sobre ela. */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  /** Remove o realce ao sair da área. */
  onDragLeave(): void {
    this.dragging.set(false);
  }

  /** Limpa o arquivo selecionado e os resultados anteriores. */
  clearFile(): void {
    this.file.set(null);
    this.result.set(null);
    this.errors.set([]);
    this.errorMessage.set(null);
  }

  /** Envia o arquivo para importação. */
  submit(): void {
    const selected = this.file();
    if (!selected || this.importing()) {
      return;
    }

    this.importing.set(true);
    this.result.set(null);
    this.errors.set([]);
    this.errorMessage.set(null);

    this.inventoryService.import(selected, this.nome().trim() || undefined).subscribe({
      next: (result) => {
        this.importing.set(false);
        this.result.set(result);
        this.file.set(null);
        this.nome.set('');
        this.loadInventories();
      },
      error: (error: HttpErrorResponse) => {
        this.importing.set(false);
        this.handleError(error);
      },
    });
  }

  /**
   * Inicia a contagem de um inventário: o motor cria o estado de todas as
   * posições e o inventário passa a `EM_CONTAGEM`, alimentando a fila dos
   * contadores vinculados.
   */
  startCounting(inv: Inventory): void {
    if (this.startingId()) {
      return;
    }
    this.startingId.set(inv._id);
    this.startFeedback.set(null);

    this.engineService.start(inv._id).subscribe({
      next: (res) => {
        this.startingId.set(null);
        this.startFeedback.set({
          type: 'ok',
          msg: `Contagem iniciada para "${inv.nome}" (${res.totalPosicoes} posições).`,
        });
        this.loadInventories();
      },
      error: (err: HttpErrorResponse) => {
        this.startingId.set(null);
        this.startFeedback.set({
          type: 'erro',
          msg: err.error?.message ?? 'Falha ao iniciar a contagem.',
        });
      },
    });
  }

  /** Indica se um inventário já pode receber contagens (foi iniciado). */
  isEmContagem(inv: Inventory): boolean {
    return inv.status === 'EM_CONTAGEM';
  }

  /** Indica se um inventário já foi finalizado. */
  isFinalizado(inv: Inventory): boolean {
    return inv.status === 'FINALIZADO';
  }

  /** Indica se um inventário está em pré-contagem (modo SEM_EXCEL). */
  isPreContagem(inv: Inventory): boolean {
    return inv.status === 'EM_PRE_CONTAGEM';
  }

  /** Reage à troca do inventário no editor de valores. */
  onValuesInventoryChange(inventoryId: string): void {
    this.valuesInventory.set(inventoryId);
    this.products.set([]);
    if (inventoryId) {
      this.loadProducts(inventoryId);
    }
  }

  /** Atualiza o rascunho do valor unitário de um produto. */
  setValor(productId: string, valor: number | null): void {
    this.products.update((list) =>
      list.map((p) => (p._id === productId ? { ...p, valorUnitario: valor ?? 0 } : p)),
    );
  }

  /** Salva o valor unitário de um produto. */
  salvarValor(product: Product): void {
    if (this.savingValueId()) {
      return;
    }
    this.savingValueId.set(product._id);
    this.inventoryService.updateProductValue(product._id, product.valorUnitario).subscribe({
      next: (updated) => {
        this.savingValueId.set(null);
        this.products.update((list) =>
          list.map((p) => (p._id === updated._id ? updated : p)),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.savingValueId.set(null);
        this.startFeedback.set({
          type: 'erro',
          msg: err.error?.message ?? 'Falha ao salvar o valor.',
        });
      },
    });
  }

  /** Carrega os produtos de um inventário. */
  private loadProducts(inventoryId: string): void {
    this.loadingValues.set(true);
    this.inventoryService.listProducts(inventoryId).subscribe({
      next: (list) => {
        this.products.set(list);
        this.loadingValues.set(false);
      },
      error: () => this.loadingValues.set(false),
    });
  }

  /** Define o arquivo, validando a extensão. */
  private setFile(file: File | null): void {
    this.result.set(null);
    this.errors.set([]);
    this.errorMessage.set(null);

    if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
      this.errorMessage.set('Selecione um arquivo Excel válido (.xlsx ou .xls).');
      this.file.set(null);
      return;
    }
    this.file.set(file);
  }

  /** Traduz o erro HTTP em mensagem e/ou lista de erros de validação. */
  private handleError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.errorMessage.set('Não foi possível conectar ao servidor.');
      return;
    }
    const body = error.error;
    this.errorMessage.set(body?.message ?? 'Falha ao importar a planilha.');
    if (Array.isArray(body?.details)) {
      this.errors.set(body.details as ImportError[]);
    }
  }

  /** Carrega a lista de inventários importados. */
  private loadInventories(): void {
    this.loadingList.set(true);
    this.inventoryService.list().subscribe({
      next: (list) => {
        this.inventories.set(list);
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false),
    });
  }

  /** Dispara o download de um blob com o nome informado. */
  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
