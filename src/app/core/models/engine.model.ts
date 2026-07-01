/**
 * Modelos do motor de contagem (Parte 6/7) no frontend.
 * Espelham os DTOs retornados pelo backend.
 */

/** Situações de uma posição no motor (idênticas ao backend). */
export enum PositionCountStatus {
  AGUARDANDO_PRIMEIRA = 'AGUARDANDO_PRIMEIRA',
  AGUARDANDO_SEGUNDA = 'AGUARDANDO_SEGUNDA',
  AGUARDANDO_TERCEIRA = 'AGUARDANDO_TERCEIRA',
  FINALIZADA = 'FINALIZADA',
}

/** Um item a contar dentro de uma tarefa (Parte 10.1 — sem expor o estoque). */
export interface CountTaskItem {
  productId: string;
  codigo: string;
  descricao: string;
}

/**
 * Uma tarefa entregue ao contador (posição da fila).
 * Não contém o estoque do sistema — a contagem não deve ser influenciada.
 */
export interface CountTask {
  positionCountId: string;
  inventoryId: string;
  inventoryNome: string;
  posicao: string;
  numeroContagem: number;
  itens: CountTaskItem[];
}

/** Fila de contagens do contador. */
export interface Queue {
  pendentes: number;
  tarefas: CountTask[];
}

/** Item contado ao submeter uma contagem (código livre ao adicionar novo item). */
export interface SubmitCountItem {
  codigo: string;
  descricao?: string;
  quantidade: number;
}

/** Corpo enviado ao submeter uma contagem de uma posição. */
export interface SubmitCount {
  inventoryId: string;
  positionCountId: string;
  itens: SubmitCountItem[];
}

/** Resultado por item após aplicar uma contagem. */
export interface SubmitCountResultItem {
  codigo: string;
  descricao: string;
  quantidadeContada: number;
  quantidadeEstoque: number;
  quantidadeFinal?: number;
  divergente?: boolean;
  adicionado: boolean;
}

/** Resultado da submissão de uma contagem. */
export interface SubmitCountResult {
  positionCountId: string;
  posicao: string;
  numeroContagem: number;
  status: PositionCountStatus;
  finalizada: boolean;
  proximaContagem: number;
  divergente?: boolean;
  itens: SubmitCountResultItem[];
  mensagem: string;
}

/** Tipos de alerta ao ADMIN. */
export enum NotificationType {
  CONTAGEM = 'CONTAGEM',
  FINALIZACAO = 'FINALIZACAO',
}

/** Alerta exibido ao ADMIN. */
export interface Alert {
  id: string;
  inventoryId: string;
  posicao: string;
  counterNome: string;
  numeroContagem: number;
  tipo: NotificationType;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

/** Resumo de alertas para o ADMIN. */
export interface AlertsSummary {
  naoLidos: number;
  alertas: Alert[];
}

/** Resultado de iniciar o motor para um inventário. */
export interface StartResult {
  totalPosicoes: number;
  criadas: number;
}
