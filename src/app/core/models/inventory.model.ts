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
  arquivoOriginal: string;
  totalItens: number;
  status: string;
  importadoPor?: { name: string; email: string } | string;
  createdAt: string;
}
