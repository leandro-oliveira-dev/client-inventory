/**
 * Painel de acompanhamento (Parte 8) — a tela administrativa.
 *
 * Apresenta, para o inventário selecionado, o progresso da contagem em tempo
 * real: indicadores globais (total contado/pendente, progresso e contagens por
 * passagem), a distribuição por situação e a lista de posições, que o ADMIN pode
 * filtrar por rua, posição, contador e tipo de contagem (situação).
 *
 * A atualização em tempo real é obtida por **polling** do endpoint do painel
 * (mesma estratégia da tela do contador da Parte 7), evitando estado de conexão
 * no servidor. O polling é pausável e não dispara enquanto uma carga está em
 * andamento.
 *
 * A regra "a mesma pessoa não conta a mesma posição duas vezes" e a proibição de
 * recontar uma posição finalizada são garantidas pelo motor (Parte 6); aqui elas
 * apenas se refletem na coluna de contagens (rastreabilidade por contador).
 */

import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryService } from '../../core/services/inventory.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Inventory } from '../../core/models/inventory.model';
import { PositionCountStatus } from '../../core/models/engine.model';
import { TrackingFilter, TrackingPanel } from '../../core/models/tracking.model';

/** Intervalo de atualização automática do painel (ms). */
const POLL_INTERVAL_MS = 10000;

/** Opção de situação para o seletor de "tipo de contagem". */
interface StatusOption {
  value: PositionCountStatus;
  label: string;
}

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acompanhamento.component.html',
  styleUrls: ['./acompanhamento.component.scss'],
})
export class AcompanhamentoComponent implements OnDestroy {
  private readonly inventoryService = inject(InventoryService);
  private readonly trackingService = inject(TrackingService);

  /** Inventários disponíveis para acompanhamento. */
  readonly inventories = signal<Inventory[]>([]);
  /** Inventário selecionado. */
  readonly selectedInventory = signal<string>('');

  /** Painel atual (resumo + filtros + posições). */
  readonly panel = signal<TrackingPanel | null>(null);
  /** Carregando o painel pela primeira vez. */
  readonly loading = signal(false);
  /** Mensagem de erro. */
  readonly error = signal<string | null>(null);
  /** Atualização automática ligada/desligada. */
  readonly autoRefresh = signal(true);

  /** Filtros escolhidos pelo ADMIN. */
  readonly filtroRua = signal<string>('');
  readonly filtroPosicao = signal<string>('');
  readonly filtroContador = signal<string>('');
  readonly filtroStatus = signal<string>('');

  /** Opções de situação (tipo de contagem) para o seletor. */
  readonly statusOptions: StatusOption[] = [
    { value: PositionCountStatus.AGUARDANDO_PRIMEIRA, label: 'Aguardando 1ª contagem' },
    { value: PositionCountStatus.AGUARDANDO_SEGUNDA, label: 'Aguardando 2ª contagem' },
    { value: PositionCountStatus.AGUARDANDO_TERCEIRA, label: 'Aguardando 3ª contagem' },
    { value: PositionCountStatus.FINALIZADA, label: 'Finalizada' },
  ];

  /** Resumo do painel (atalho). */
  readonly resumo = computed(() => this.panel()?.resumo ?? null);
  /** Posições exibidas (já filtradas pelo backend). */
  readonly posicoes = computed(() => this.panel()?.posicoes ?? []);
  /** Indica se algum filtro está ativo. */
  readonly hasFiltros = computed(
    () =>
      !!this.filtroRua() ||
      !!this.filtroPosicao() ||
      !!this.filtroContador() ||
      !!this.filtroStatus(),
  );

  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadInventories();
    this.pollId = setInterval(() => {
      if (this.autoRefresh() && this.selectedInventory() && !this.loading()) {
        this.loadPanel(false);
      }
    }, POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollId !== null) {
      clearInterval(this.pollId);
    }
  }

  /** Reage à troca do inventário selecionado. */
  onInventoryChange(inventoryId: string): void {
    this.selectedInventory.set(inventoryId);
    this.resetFiltros();
    this.panel.set(null);
    if (inventoryId) {
      this.loadPanel(true);
    }
  }

  /** Reage à alteração de qualquer filtro. */
  onFilterChange(): void {
    if (this.selectedInventory()) {
      this.loadPanel(false);
    }
  }

  /** Limpa todos os filtros e recarrega. */
  clearFiltros(): void {
    this.resetFiltros();
    this.onFilterChange();
  }

  /** Alterna a atualização automática. */
  toggleAutoRefresh(): void {
    this.autoRefresh.update((v) => !v);
  }

  /** Recarrega o painel manualmente. */
  refresh(): void {
    if (this.selectedInventory()) {
      this.loadPanel(false);
    }
  }

  /** Rótulo amigável de uma situação de posição. */
  statusLabel(status: PositionCountStatus): string {
    return (
      this.statusOptions.find((o) => o.value === status)?.label ??
      String(status)
    );
  }

  /** Classe CSS (cor) associada a uma situação. */
  statusClass(status: PositionCountStatus): string {
    switch (status) {
      case PositionCountStatus.FINALIZADA:
        return 'finalizada';
      case PositionCountStatus.AGUARDANDO_SEGUNDA:
        return 'segunda';
      case PositionCountStatus.AGUARDANDO_TERCEIRA:
        return 'terceira';
      default:
        return 'primeira';
    }
  }

  /** Rótulo ordinal (1ª/2ª/3ª) de uma contagem. */
  ordinal(numero: number): string {
    return numero === 1 ? '1ª' : numero === 2 ? '2ª' : '3ª';
  }

  private resetFiltros(): void {
    this.filtroRua.set('');
    this.filtroPosicao.set('');
    this.filtroContador.set('');
    this.filtroStatus.set('');
  }

  /** Carrega a lista de inventários e seleciona um por padrão. */
  private loadInventories(): void {
    this.inventoryService.list().subscribe({
      next: (list) => {
        this.inventories.set(list);
        // Prioriza um inventário em contagem; senão, o mais recente.
        const emContagem = list.find((i) => i.status === 'EM_CONTAGEM');
        const escolhido = emContagem ?? list[0];
        if (escolhido) {
          this.selectedInventory.set(escolhido._id);
          this.loadPanel(true);
        }
      },
      error: (err: HttpErrorResponse) => this.error.set(this.parseError(err)),
    });
  }

  /** Carrega o painel do inventário selecionado com os filtros atuais. */
  private loadPanel(initial: boolean): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId) {
      return;
    }
    if (initial) {
      this.loading.set(true);
    }

    const filtros: TrackingFilter = {
      rua: this.filtroRua() || undefined,
      posicao: this.filtroPosicao() || undefined,
      counterId: this.filtroContador() || undefined,
      status: (this.filtroStatus() as PositionCountStatus) || undefined,
    };

    this.trackingService.panel(inventoryId, filtros).subscribe({
      next: (panel) => {
        this.panel.set(panel);
        this.loading.set(false);
        this.error.set(null);
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
    return err.error?.message ?? 'Ocorreu um erro ao carregar o painel.';
  }
}
