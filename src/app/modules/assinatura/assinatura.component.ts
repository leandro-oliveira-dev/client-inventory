/**
 * Tela de Assinatura Digital (Parte 10).
 *
 * Fecha o ciclo do inventário: para um inventário **finalizado**, o ADMIN gera o
 * documento de encerramento (PDF com produtos, valores, divergências e resultado
 * final) e captura, na mesma sessão, as assinaturas do **responsável (ADMIN)** e
 * do **cliente**. Quando ambas são registradas, o documento final assinado é
 * armazenado no servidor e fica disponível para download.
 *
 * O PDF pode ser baixado a qualquer momento após a geração — como **prévia**
 * enquanto pendente, ou como **documento final** depois de assinado.
 */

import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import { SignatureService } from '../../core/services/signature.service';
import { Inventory } from '../../core/models/inventory.model';
import {
  SignatureDocument,
  SignatureStatus,
  SignerType,
} from '../../core/models/signature.model';
import { SignaturePadComponent } from '../../shared/components/signature-pad/signature-pad.component';

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [CommonModule, FormsModule, SignaturePadComponent],
  templateUrl: './assinatura.component.html',
  styleUrls: ['./assinatura.component.scss'],
})
export class AssinaturaComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly signatureService = inject(SignatureService);

  /** Enum exposto ao template. */
  readonly SignerType = SignerType;

  @ViewChild('padAdmin') private readonly padAdmin?: SignaturePadComponent;
  @ViewChild('padCliente') private readonly padCliente?: SignaturePadComponent;

  /** Inventários disponíveis. */
  readonly inventories = signal<Inventory[]>([]);
  /** Inventário selecionado. */
  readonly selectedInventory = signal<string>('');

  /** Documento de assinatura atual (null se ainda não gerado). */
  readonly doc = signal<SignatureDocument | null>(null);

  /** Estados de carregamento/feedback. */
  readonly loading = signal(false);
  readonly generating = signal(false);
  readonly signing = signal<SignerType | null>(null);
  readonly downloading = signal(false);
  readonly error = signal<string | null>(null);

  /** Nomes digitados para cada assinatura. */
  readonly nomeAdmin = signal<string>('');
  readonly nomeCliente = signal<string>('');

  /** Inventário selecionado (objeto). */
  private readonly inventory = computed<Inventory | undefined>(() =>
    this.inventories().find((i) => i._id === this.selectedInventory()),
  );

  /** O inventário selecionado está finalizado? */
  readonly isFinalizado = computed(() => this.inventory()?.status === 'FINALIZADO');

  /** Ambas as assinaturas foram registradas? */
  readonly assinado = computed(() => this.doc()?.status === SignatureStatus.ASSINADO);

  constructor() {
    this.loadInventories();
  }

  /** Reage à troca do inventário selecionado. */
  onInventoryChange(inventoryId: string): void {
    this.selectedInventory.set(inventoryId);
    this.doc.set(null);
    this.error.set(null);
    this.nomeAdmin.set('');
    this.nomeCliente.set('');
    if (inventoryId) {
      this.loadStatus();
    }
  }

  /** Gera o documento de assinatura. */
  gerar(): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId || this.generating()) {
      return;
    }
    this.generating.set(true);
    this.error.set(null);
    this.signatureService.generate(inventoryId).subscribe({
      next: (doc) => {
        this.generating.set(false);
        this.doc.set(doc);
      },
      error: (err: HttpErrorResponse) => {
        this.generating.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  /** Registra a assinatura do tipo informado (ADMIN ou CLIENTE). */
  assinar(tipo: SignerType): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId || this.signing()) {
      return;
    }
    const nome = (tipo === SignerType.ADMIN ? this.nomeAdmin() : this.nomeCliente()).trim();
    if (!nome) {
      this.error.set('Informe o nome de quem está assinando.');
      return;
    }
    const pad = tipo === SignerType.ADMIN ? this.padAdmin : this.padCliente;
    const imagem = pad?.toDataURL() ?? undefined;

    this.signing.set(tipo);
    this.error.set(null);
    this.signatureService.sign(inventoryId, { tipo, nome, imagem }).subscribe({
      next: (doc) => {
        this.signing.set(null);
        this.doc.set(doc);
        pad?.clear();
      },
      error: (err: HttpErrorResponse) => {
        this.signing.set(null);
        this.error.set(this.parseError(err));
      },
    });
  }

  /** Baixa o PDF (final quando assinado, ou prévia). */
  baixarPdf(): void {
    const inventoryId = this.selectedInventory();
    const doc = this.doc();
    if (!inventoryId || this.downloading() || !doc) {
      return;
    }
    this.downloading.set(true);
    this.signatureService.pdf(inventoryId).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const sufixo = this.assinado() ? 'assinado' : 'previa';
        this.downloadBlob(blob, `inventario-${this.slug(doc.inventoryNome)}-${sufixo}.pdf`);
      },
      error: (err: HttpErrorResponse) => {
        this.downloading.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  private loadInventories(): void {
    this.inventoryService.list().subscribe({
      next: (list) => {
        this.inventories.set(list);
        // Prioriza um inventário finalizado (assinável).
        const escolhido = list.find((i) => i.status === 'FINALIZADO') ?? list[0];
        if (escolhido) {
          this.selectedInventory.set(escolhido._id);
          this.loadStatus();
        }
      },
      error: (err: HttpErrorResponse) => this.error.set(this.parseError(err)),
    });
  }

  private loadStatus(): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId) {
      return;
    }
    this.loading.set(true);
    this.signatureService.status(inventoryId).subscribe({
      next: (doc) => {
        this.doc.set(doc);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private slug(nome: string): string {
    return (
      nome
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'inventario'
    );
  }

  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
    return err.error?.message ?? 'Ocorreu um erro. Tente novamente.';
  }
}
