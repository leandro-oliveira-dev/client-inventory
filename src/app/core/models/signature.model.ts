/**
 * Modelos do módulo de assinatura digital (Parte 10) no frontend.
 * Espelham os DTOs retornados pelo backend (`signature.dto.ts`).
 */

/** Situação do documento de assinatura. */
export enum SignatureStatus {
  PENDENTE = 'PENDENTE',
  ASSINADO = 'ASSINADO',
}

/** Quem assina o documento. */
export enum SignerType {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
}

/** Dados de uma assinatura registrada. */
export interface SignatureInfo {
  nome: string;
  assinadoEm: string;
  possuiImagem: boolean;
}

/** Metadados do documento de assinatura. */
export interface SignatureDocument {
  inventoryId: string;
  inventoryNome: string;
  status: SignatureStatus;
  hash: string;
  geradoEm: string;
  assinaturaAdmin: SignatureInfo | null;
  assinaturaCliente: SignatureInfo | null;
}

/** Corpo para registrar uma assinatura. */
export interface SignRequest {
  tipo: SignerType;
  nome: string;
  imagem?: string;
}
