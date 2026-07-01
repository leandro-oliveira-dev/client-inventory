/**
 * Modelos do painel de acompanhamento (Parte 8) no frontend.
 * Espelham os DTOs retornados pelo backend (`tracking.dto.ts`).
 */

import { PositionCountStatus } from './engine.model';

/** Filtros aplicáveis ao painel (todos opcionais). */
export interface TrackingFilter {
  rua?: string;
  posicao?: string;
  counterId?: string;
  status?: PositionCountStatus;
}

/** Indicadores globais do inventário. */
export interface TrackingSummary {
  totalPosicoes: number;
  totalContado: number;
  totalPendente: number;
  progresso: number;
  primeiraContagem: number;
  segundaContagem: number;
  terceiraContagem: number;
  totalContagens: number;
  aguardandoPrimeira: number;
  aguardandoSegunda: number;
  aguardandoTerceira: number;
  divergentes: number;
}

/** Quantidade contada de um item em uma passagem. */
export interface TrackingCountItem {
  codigo: string;
  quantidade: number;
}

/** Uma contagem individual aplicada a uma posição. */
export interface TrackingCount {
  numero: number;
  counterNome: string;
  horario: string;
  itens: TrackingCountItem[];
}

/** Um item de uma posição exibido no painel (Parte 10.1 — multi-item). */
export interface TrackingPositionItem {
  codigo: string;
  descricao: string;
  quantidadeEstoque: number;
  quantidadeFinal?: number;
  divergente?: boolean;
  adicionado: boolean;
}

/** Linha de posição exibida no painel. */
export interface TrackingPosition {
  id: string;
  posicao: string;
  rua: string;
  status: PositionCountStatus;
  proximaContagem: number;
  divergente?: boolean;
  finalizadaEm?: string;
  itens: TrackingPositionItem[];
  contagens: TrackingCount[];
}

/** Opção de contador para o filtro. */
export interface TrackingCounterOption {
  id: string;
  nome: string;
}

/** Opções disponíveis para os filtros. */
export interface TrackingFilterOptions {
  ruas: string[];
  posicoes: string[];
  contadores: TrackingCounterOption[];
}

/** Resposta completa do painel de acompanhamento. */
export interface TrackingPanel {
  inventoryId: string;
  inventoryNome: string;
  status: string;
  resumo: TrackingSummary;
  filtros: TrackingFilterOptions;
  filtrosAplicados: TrackingFilter;
  posicoes: TrackingPosition[];
  atualizadoEm: string;
}
