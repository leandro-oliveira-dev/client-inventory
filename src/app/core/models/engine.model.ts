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

/**
 * Uma tarefa entregue ao contador (item da fila).
 * Não contém o estoque do sistema — a contagem não deve ser influenciada.
 */
export interface CountTask {
  positionCountId: string;
  inventoryId: string;
  inventoryNome: string;
  posicao: string;
  productId: string;
  codigo: string;
  descricao: string;
  numeroContagem: number;
}

/** Fila de contagens do contador. */
export interface Queue {
  pendentes: number;
  tarefas: CountTask[];
}

/** Corpo enviado ao submeter uma contagem. */
export interface SubmitCount {
  inventoryId: string;
  productId: string;
  quantidadeContada: number;
}

/** Resultado da submissão de uma contagem. */
export interface SubmitCountResult {
  positionCountId: string;
  posicao: string;
  numeroContagem: number;
  quantidadeContada: number;
  quantidadeEstoque: number;
  status: PositionCountStatus;
  finalizada: boolean;
  proximaContagem: number;
  quantidadeFinal?: number;
  divergente?: boolean;
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
