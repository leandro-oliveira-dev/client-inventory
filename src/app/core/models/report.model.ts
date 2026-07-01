/**
 * Modelos do módulo de relatórios (Parte 9) no frontend.
 * Espelham os DTOs retornados pelo backend (`report.dto.ts`).
 */

/** Uma linha do relatório (um produto/posição). */
export interface ReportItem {
  positionCountId?: string;
  productId: string;
  cliente: string;
  codigo: string;
  descricao: string;
  posicao: string;
  rua: string;
  valorUnitario: number;
  estoqueAntes: number;
  estoqueDepois: number | null;
  diferenca: number | null;
  sobra: number;
  falta: number;
  divergenciaFinanceira: number;
  contado: boolean;
  divergente: boolean;
}

/** Indicadores agregados do inventário. */
export interface ReportSummary {
  totalItens: number;
  itensContados: number;
  itensPendentes: number;
  itensOk: number;
  itensDivergentes: number;
  itensSobra: number;
  itensFalta: number;
  unidadesAntes: number;
  unidadesDepois: number;
  unidadesSobra: number;
  unidadesFalta: number;
  valorEstoqueAntes: number;
  valorEstoqueDepois: number;
  valorSobra: number;
  valorFalta: number;
  divergenciaFinanceiraLiquida: number;
  divergenciaFinanceiraAbsoluta: number;
  percentualContado: number;
  percentualDivergencia: number;
  percentualAcuracidade: number;
}

/** Distribuição de itens por resultado. */
export interface ReportDistribution {
  ok: number;
  sobra: number;
  falta: number;
  pendente: number;
}

/** Opções para os filtros do dashboard. */
export interface ReportFilterOptions {
  clientes: string[];
  ruas: string[];
}

/** Relatório completo de um inventário. */
export interface Report {
  inventoryId: string;
  inventoryNome: string;
  status: string;
  resumo: ReportSummary;
  distribuicao: ReportDistribution;
  ranking: ReportItem[];
  itens: ReportItem[];
  filtros: ReportFilterOptions;
  geradoEm: string;
}
