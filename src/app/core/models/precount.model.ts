/**
 * Modelos do módulo de pré-contagem (Parte 10.1) no frontend.
 * Espelham os DTOs do backend (`precount.dto.ts`).
 */

/** Um item levantado na pré-contagem. */
export interface PreCountItem {
  codigo: string;
  descricao: string;
  quantidade: number;
}

/** Uma posição já levantada na pré-contagem. */
export interface PreCountPosition {
  posicao: string;
  itens: PreCountItem[];
  totalUnidades: number;
  atualizadoEm: string;
}

/** Resumo da pré-contagem de um inventário. */
export interface PreCountSummary {
  inventoryId: string;
  inventoryNome: string;
  status: string;
  cliente?: string;
  totalPosicoes: number;
  totalItens: number;
  totalUnidades: number;
  posicoes: PreCountPosition[];
}

/** Corpo para criar um inventário sem Excel. */
export interface CreateBlankInventory {
  nome: string;
  cliente?: string;
}

/** Corpo para submeter a pré-contagem de uma posição. */
export interface SubmitPreCount {
  inventoryId: string;
  posicao: string;
  itens: PreCountItem[];
}

/** Resultado do encerramento da pré-contagem. */
export interface ClosePreCountResult {
  inventoryId: string;
  status: string;
  produtosCriados: number;
}
