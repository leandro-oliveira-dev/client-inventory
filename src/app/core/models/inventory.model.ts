/**
 * Modelos do módulo de inventário (Parte 4) no frontend.
 * Espelham os DTOs retornados pelo backend.
 */

/** Erro de validação de uma linha/coluna da planilha. */
export interface ImportError {
  linha: number;
  coluna?: string;
  mensagem: string;
}

/** Resultado de uma importação bem-sucedida. */
export interface ImportResult {
  inventoryId: string;
  nome: string;
  totalLinhas: number;
  totalImportado: number;
}

/** Inventário retornado na listagem. */
export interface Inventory {
  _id: string;
  nome: string;
  modo?: string;
  cliente?: string;
  arquivoOriginal: string;
  totalItens: number;
  status: string;
  importadoPor?: { name: string; email: string } | string;
  createdAt: string;
}

/** Produto de um inventário (para edição de valor unitário — Parte 10.1). */
export interface Product {
  _id: string;
  inventory: string;
  cliente: string;
  codigo: string;
  descricao: string;
  valorUnitario: number;
  quantidadeAntes: number;
  posicao: string;
  origem?: string;
}
