/**
 * Tela de Resultados / Relatórios (Parte 9) — dashboard administrativo.
 *
 * Apresenta o resultado consolidado da contagem de um inventário: os cálculos de
 * estoque antes/depois, sobra, falta e divergência financeira (Parte 9), com
 * gráficos (distribuição e ranking), percentuais, filtros e exportação em Excel.
 *
 * Os cálculos são feitos no backend (`ReportService`); esta tela apenas exibe e
 * aplica filtros locais sobre a lista de itens, além de disparar o download da
 * planilha.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import { ReportService } from '../../core/services/report.service';
import { Inventory } from '../../core/models/inventory.model';
import { Report, ReportItem } from '../../core/models/report.model';

/** Segmento do gráfico de rosca (distribuição). */
interface DonutSegment {
  label: string;
  value: number;
  color: string;
  dashArray: string;
  dashOffset: string;
}

/** Raio e circunferência do gráfico de rosca. */
const DONUT_RADIUS = 54;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss'],
})
export class ResultadosComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly reportService = inject(ReportService);

  /** Inventários disponíveis. */
  readonly inventories = signal<Inventory[]>([]);
  /** Inventário selecionado. */
  readonly selectedInventory = signal<string>('');

  /** Relatório atual. */
  readonly report = signal<Report | null>(null);
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly error = signal<string | null>(null);

  /** Filtros locais. */
  readonly filtroCliente = signal<string>('');
  readonly filtroRua = signal<string>('');
  readonly filtroSituacao = signal<string>('');

  /** Constantes do gráfico de rosca. */
  readonly donutRadius = DONUT_RADIUS;
  readonly donutCircumference = DONUT_CIRCUMFERENCE;

  /** Atalhos. */
  readonly resumo = computed(() => this.report()?.resumo ?? null);
  readonly distribuicao = computed(() => this.report()?.distribuicao ?? null);
  readonly ranking = computed(() => this.report()?.ranking ?? []);

  /** Itens após aplicar os filtros locais. */
  readonly itensFiltrados = computed<ReportItem[]>(() => {
    const itens = this.report()?.itens ?? [];
    const cliente = this.filtroCliente();
    const rua = this.filtroRua();
    const situacao = this.filtroSituacao();

    return itens.filter((i) => {
      if (cliente && i.cliente !== cliente) {
        return false;
      }
      if (rua && i.rua !== rua) {
        return false;
      }
      return this.matchSituacao(i, situacao);
    });
  });

  /** Indica se há algum filtro ativo. */
  readonly hasFiltros = computed(
    () => !!this.filtroCliente() || !!this.filtroRua() || !!this.filtroSituacao(),
  );

  /** Segmentos do gráfico de rosca (distribuição). */
  readonly donutSegments = computed<DonutSegment[]>(() => {
    const d = this.distribuicao();
    if (!d) {
      return [];
    }
    const dados = [
      { label: 'Sem divergência', value: d.ok, color: 'var(--success)' },
      { label: 'Sobra', value: d.sobra, color: 'var(--primary)' },
      { label: 'Falta', value: d.falta, color: 'var(--danger)' },
      { label: 'Pendente', value: d.pendente, color: 'var(--text-muted)' },
    ];
    const total = dados.reduce((acc, s) => acc + s.value, 0);
    if (total === 0) {
      return [];
    }

    let acumulado = 0;
    return dados
      .filter((s) => s.value > 0)
      .map((s) => {
        const comprimento = (s.value / total) * DONUT_CIRCUMFERENCE;
        const segment: DonutSegment = {
          label: s.label,
          value: s.value,
          color: s.color,
          dashArray: `${comprimento} ${DONUT_CIRCUMFERENCE - comprimento}`,
          dashOffset: `${-acumulado}`,
        };
        acumulado += comprimento;
        return segment;
      });
  });

  /** Maior módulo de divergência do ranking (base para as barras). */
  readonly rankingMax = computed<number>(() =>
    this.ranking().reduce((max, i) => Math.max(max, Math.abs(i.divergenciaFinanceira)), 0),
  );

  constructor() {
    this.loadInventories();
  }

  /** Reage à troca do inventário selecionado. */
  onInventoryChange(inventoryId: string): void {
    this.selectedInventory.set(inventoryId);
    this.resetFiltros();
    this.report.set(null);
    if (inventoryId) {
      this.loadReport();
    }
  }

  /** Recarrega o relatório. */
  refresh(): void {
    if (this.selectedInventory()) {
      this.loadReport();
    }
  }

  /** Limpa os filtros. */
  clearFiltros(): void {
    this.resetFiltros();
  }

  /** Dispara o download da exportação em Excel. */
  exportar(): void {
    const inventoryId = this.selectedInventory();
    const report = this.report();
    if (!inventoryId || this.exporting()) {
      return;
    }
    this.exporting.set(true);
    this.reportService.export(inventoryId).subscribe({
      next: (blob) => {
        this.exporting.set(false);
        this.downloadBlob(blob, `relatorio-${this.slug(report?.inventoryNome ?? 'inventario')}.xlsx`);
      },
      error: (err: HttpErrorResponse) => {
        this.exporting.set(false);
        this.error.set(this.parseError(err));
      },
    });
  }

  /** Formata um valor monetário em Reais (pt-BR). */
  money(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value ?? 0);
  }

  /** Formata um número (pt-BR). */
  num(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value ?? 0);
  }

  /** Largura (%) da barra de um item no ranking. */
  rankingWidth(item: ReportItem): number {
    const max = this.rankingMax();
    return max === 0 ? 0 : (Math.abs(item.divergenciaFinanceira) / max) * 100;
  }

  /** Rótulo da situação de um item. */
  situacaoLabel(item: ReportItem): string {
    if (!item.contado) {
      return 'Pendente';
    }
    if (!item.divergente) {
      return 'OK';
    }
    return item.sobra > 0 ? 'Sobra' : 'Falta';
  }

  /** Classe CSS da situação de um item. */
  situacaoClass(item: ReportItem): string {
    if (!item.contado) {
      return 'pendente';
    }
    if (!item.divergente) {
      return 'ok';
    }
    return item.sobra > 0 ? 'sobra' : 'falta';
  }

  private matchSituacao(item: ReportItem, situacao: string): boolean {
    switch (situacao) {
      case 'ok':
        return item.contado && !item.divergente;
      case 'divergente':
        return item.divergente;
      case 'sobra':
        return item.sobra > 0;
      case 'falta':
        return item.falta > 0;
      case 'pendente':
        return !item.contado;
      default:
        return true;
    }
  }

  private resetFiltros(): void {
    this.filtroCliente.set('');
    this.filtroRua.set('');
    this.filtroSituacao.set('');
  }

  private loadInventories(): void {
    this.inventoryService.list().subscribe({
      next: (list) => {
        this.inventories.set(list);
        const escolhido = list[0];
        if (escolhido) {
          this.selectedInventory.set(escolhido._id);
          this.loadReport();
        }
      },
      error: (err: HttpErrorResponse) => this.error.set(this.parseError(err)),
    });
  }

  private loadReport(): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.reportService.report(inventoryId).subscribe({
      next: (report) => {
        this.report.set(report);
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
    return err.error?.message ?? 'Ocorreu um erro ao carregar o relatório.';
  }
}
