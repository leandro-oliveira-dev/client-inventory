/**
 * Tela de Iniciar Inventário (Parte 4).
 *
 * Permite ao ADMIN baixar a planilha-modelo, enviar um arquivo Excel (clique
 * ou arrastar-e-soltar) e importar o inventário. Exibe o resultado da
 * importação ou a lista de erros de validação retornada pelo backend, além de
 * listar os inventários já importados.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import {
  ImportError,
  ImportResult,
  Inventory,
} from '../../core/models/inventory.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent {
  private readonly inventoryService = inject(InventoryService);

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
